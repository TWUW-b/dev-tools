<?php
/**
 * Debug Notes API - Test Controller
 */

declare(strict_types=1);

class TestController
{
    private Database $db;
    private NotesController $notesController;

    public function __construct(Database $db, NotesController $notesController)
    {
        $this->db = $db;
        $this->notesController = $notesController;
    }

    /**
     * テストケースインポート（UPSERT、case_key ベース）
     *
     * 入力: cases[].case_key は必須。ドメイン/capability/title の変更は
     * 既存行を UPDATE する（test_runs / notes の紐付けを維持）。
     */
    public function importCases(array $input): array
    {
        $cases = $input['cases'] ?? [];
        if (empty($cases) || !is_array($cases)) {
            return ['success' => false, 'error' => 'cases is required'];
        }

        if (count($cases) > 1000) {
            return ['success' => false, 'error' => 'Too many cases (max 1000)'];
        }

        $this->db->beginTransaction();
        try {
            $inserted = 0;
            $updated = 0;
            $unarchived = 0;
            $seenKeys = [];
            foreach ($cases as $case) {
                $caseKey = isset($case['case_key']) ? mb_substr(trim((string)$case['case_key']), 0, 100) : '';
                $domain = isset($case['domain']) ? mb_substr(trim($case['domain']), 0, 200) : '';
                $capability = isset($case['capability']) ? mb_substr(trim($case['capability']), 0, 200) : '';
                $title = isset($case['title']) ? mb_substr(trim($case['title']), 0, 500) : '';

                if ($caseKey === '' || $domain === '' || $capability === '' || $title === '') {
                    continue;
                }
                if (isset($seenKeys[$caseKey])) {
                    $this->db->rollBack();
                    return ['success' => false, 'error' => "Duplicate case_key in payload: {$caseKey}"];
                }
                $seenKeys[$caseKey] = true;

                $existing = $this->db->fetchOne(
                    'SELECT id, domain, capability, title, archived_at FROM test_cases WHERE case_key = ?',
                    [$caseKey]
                );
                if ($existing) {
                    if (
                        $existing['domain'] !== $domain ||
                        $existing['capability'] !== $capability ||
                        $existing['title'] !== $title ||
                        $existing['archived_at'] !== null
                    ) {
                        $this->db->execute(
                            'UPDATE test_cases SET domain = ?, capability = ?, title = ?, archived_at = NULL WHERE case_key = ?',
                            [$domain, $capability, $title, $caseKey]
                        );
                        if ($existing['archived_at'] !== null) {
                            $unarchived++;
                        } else {
                            $updated++;
                        }
                    }
                } else {
                    // 新規 case_key だが、(domain, capability, title) 完全一致の
                    // LEGACY-* 行が archived 状態で存在する場合はそれを合流させる。
                    // これにより v11 バックフィル前に記録された test_runs が
                    // 新しい case_key に自動的に紐付く（id 不変）。
                    $legacy = $this->db->fetchOne(
                        "SELECT id, case_key FROM test_cases
                         WHERE domain = ? AND capability = ? AND title = ?
                           AND case_key LIKE 'LEGACY-%'
                         ORDER BY id ASC LIMIT 1",
                        [$domain, $capability, $title]
                    );
                    if ($legacy) {
                        $this->db->execute(
                            'UPDATE test_cases SET case_key = ?, archived_at = NULL WHERE id = ?',
                            [$caseKey, $legacy['id']]
                        );
                        $unarchived++;
                    } else {
                        $this->db->execute(
                            'INSERT INTO test_cases (case_key, domain, capability, title) VALUES (?, ?, ?, ?)',
                            [$caseKey, $domain, $capability, $title]
                        );
                        $inserted++;
                    }
                }
            }

            if ($inserted === 0 && $updated === 0 && $unarchived === 0 && count($seenKeys) === 0) {
                $this->db->rollBack();
                return ['success' => false, 'error' => 'No valid cases to import'];
            }

            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log('importCases error: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Failed to import cases'];
        }

        $total = $this->db->fetchOne('SELECT COUNT(*) as cnt FROM test_cases WHERE archived_at IS NULL');

        return [
            'success' => true,
            'total' => (int)($total['cnt'] ?? 0),
            'inserted' => $inserted,
            'updated' => $updated,
            'unarchived' => $unarchived,
        ];
    }

    /**
     * テストケース一覧（DebugAdmin用）
     */
    public function listCases(array $query = []): array
    {
        $includeArchived = !empty($query['includeArchived']) && $query['includeArchived'] !== '0';
        $sql = 'SELECT id, case_key, domain, capability, title, archived_at, created_at FROM test_cases';
        if (!$includeArchived) {
            $sql .= ' WHERE archived_at IS NULL';
        }
        $sql .= ' ORDER BY domain, capability, title';
        $cases = $this->db->query($sql);
        return [
            'success' => true,
            'data' => $cases,
        ];
    }

    /**
     * ツリー構造+集計取得（PiPテストタブ用）
     */
    public function tree(string $env): array
    {
        // 全 test_cases + 直近 test_run result + open note 件数を集計
        $rows = $this->db->query('
            SELECT
                tc.id as case_id,
                tc.domain,
                tc.capability,
                tc.title,
                (
                    SELECT tr.result
                    FROM test_runs tr
                    WHERE tr.case_id = tc.id AND tr.env = ?
                    ORDER BY tr.created_at DESC
                    LIMIT 1
                ) as last_result,
                (
                    SELECT COUNT(*)
                    FROM note_test_cases ntc
                    JOIN notes n ON n.id = ntc.note_id
                    WHERE ntc.case_id = tc.id
                      AND n.status IN (\'open\', \'rejected\')
                      AND n.deleted_at IS NULL
                ) as open_issues
            FROM test_cases tc
            WHERE tc.archived_at IS NULL
            ORDER BY tc.domain, tc.capability, tc.id
        ', [$env]);

        // ツリー構造に変換
        $tree = [];
        $domainMap = [];

        foreach ($rows as $row) {
            $domain = $row['domain'];
            $capability = $row['capability'];

            if (!isset($domainMap[$domain])) {
                $domainMap[$domain] = [
                    'domain' => $domain,
                    'capabilities' => [],
                ];
            }

            $capMap = &$domainMap[$domain]['capabilities'];
            $capKey = $capability;

            if (!isset($capMap[$capKey])) {
                $capMap[$capKey] = [
                    'capability' => $capability,
                    'total' => 0,
                    'passed' => 0,
                    'failed' => 0,
                    'status' => null,
                    'openIssues' => 0,
                    'cases' => [],
                ];
            }

            $last = $row['last_result'];
            $openIssues = (int)$row['open_issues'];

            $capMap[$capKey]['cases'][] = [
                'caseId' => (int)$row['case_id'],
                'title' => $row['title'],
                'last' => $last,
                'openIssues' => $openIssues,
            ];

            $capMap[$capKey]['total']++;
            $capMap[$capKey]['openIssues'] += $openIssues;
            if ($last === 'pass') {
                $capMap[$capKey]['passed']++;
            } elseif ($last === 'fail') {
                $capMap[$capKey]['failed']++;
            }
        }

        // Capability ステータス計算 + 配列化
        foreach ($domainMap as &$domainEntry) {
            $caps = [];
            foreach ($domainEntry['capabilities'] as &$cap) {
                $hasFailWithOpenIssues = false;
                $hasFailWithoutOpenIssues = false;
                foreach ($cap['cases'] as $c) {
                    if ($c['last'] === 'fail') {
                        if ($c['openIssues'] > 0) {
                            $hasFailWithOpenIssues = true;
                        } else {
                            $hasFailWithoutOpenIssues = true;
                        }
                    }
                }

                if ($hasFailWithOpenIssues) {
                    $cap['status'] = 'fail';
                } elseif ($hasFailWithoutOpenIssues) {
                    $cap['status'] = 'retest';
                } elseif ($cap['passed'] === $cap['total'] && $cap['total'] > 0) {
                    $cap['status'] = 'passed';
                } else {
                    $cap['status'] = null;
                }
                $caps[] = $cap;
            }
            $domainEntry['capabilities'] = $caps;
            $tree[] = $domainEntry;
        }

        return [
            'success' => true,
            'data' => $tree,
        ];
    }

    /**
     * テストケース一括削除
     */
    public function deleteCases(array $input): array
    {
        $ids = $input['ids'] ?? [];
        if (empty($ids) || !is_array($ids)) {
            return ['success' => false, 'error' => 'ids is required'];
        }
        if (count($ids) > 100) {
            return ['success' => false, 'error' => 'Too many ids (max 100)'];
        }

        $ids = array_map('intval', $ids);
        $ids = array_filter($ids, fn($id) => $id > 0);
        if (empty($ids)) {
            return ['success' => false, 'error' => 'No valid ids'];
        }

        $ids = array_values($ids);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        // ソフトデリート: archived_at を立てるだけ。test_runs / notes 紐付けは維持。
        $this->db->beginTransaction();
        try {
            $deleted = $this->db->execute(
                "UPDATE test_cases SET archived_at = CURRENT_TIMESTAMP WHERE id IN ($placeholders) AND archived_at IS NULL",
                $ids
            );
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log('deleteCases error: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Failed to archive cases'];
        }

        return ['success' => true, 'deleted' => $deleted];
    }

    /**
     * テスト実行結果一括記録（Capability単位）
     */
    public function submitRuns(string $env, array $input): array
    {
        $runs = $input['runs'] ?? [];
        $failNote = $input['failNote'] ?? null;

        if (empty($runs) || !is_array($runs)) {
            return ['success' => false, 'error' => 'runs is required'];
        }

        // pass を先に処理（fail時のノート作成前にpass記録を確定）
        usort($runs, function ($a, $b) {
            $order = ['pass' => 0, 'skip' => 1, 'fail' => 2];
            return ($order[$a['result'] ?? ''] ?? 9) - ($order[$b['result'] ?? ''] ?? 9);
        });

        // 同一caseIdの重複を排除（fail優先）
        $deduped = [];
        foreach ($runs as $run) {
            $caseId = (int)($run['caseId'] ?? 0);
            if ($caseId <= 0) continue;
            if (!isset($deduped[$caseId]) || $run['result'] === 'fail') {
                $deduped[$caseId] = $run;
            }
        }
        $runs = array_values($deduped);

        $this->db->beginTransaction();
        try {
            $results = [];
            $sharedNoteId = null;

            // failNote がある場合、先にノートを1つ作成（個別noteがないfailケース用）
            if ($failNote && !empty($failNote['content'])) {
                $failCaseIds = [];
                foreach ($runs as $run) {
                    if (($run['result'] ?? '') === 'fail' && empty($run['note'])) {
                        $cid = (int)($run['caseId'] ?? 0);
                        if ($cid > 0) {
                            $failCaseIds[] = $cid;
                        }
                    }
                }

                if (!empty($failCaseIds)) {
                    $noteResult = $this->notesController->create([
                        'content' => $failNote['content'],
                        'severity' => $failNote['severity'] ?? null,
                        'source' => 'test',
                        'testCaseIds' => $failCaseIds,
                        'consoleLogs' => $failNote['consoleLogs'] ?? null,
                        'networkLogs' => $failNote['networkLogs'] ?? null,
                        'environment' => $failNote['environment'] ?? null,
                    ]);
                    if (!$noteResult['success']) {
                        throw new \RuntimeException('Failed to create shared failNote');
                    }
                    if (isset($noteResult['note']['id'])) {
                        $sharedNoteId = (int)$noteResult['note']['id'];
                    }
                }
            }

            foreach ($runs as $run) {
                $caseId = (int)($run['caseId'] ?? 0);
                $result = $run['result'] ?? '';

                if ($caseId <= 0 || !in_array($result, ['pass', 'fail', 'skip'], true)) {
                    continue;
                }

                // caseId 存在確認
                $caseExists = $this->db->fetchOne(
                    'SELECT id FROM test_cases WHERE id = ?',
                    [$caseId]
                );
                if (!$caseExists) {
                    continue;
                }

                $noteId = null;

                if ($result === 'fail') {
                    if (!empty($run['note'])) {
                        // 個別 note（旧形式互換）
                        $noteContent = $run['note']['content'] ?? '';
                        if (!empty($noteContent)) {
                            $noteResult = $this->notesController->create([
                                'content' => $noteContent,
                                'severity' => $run['note']['severity'] ?? null,
                                'source' => 'test',
                                'testCaseId' => $caseId,
                                'consoleLogs' => $run['note']['consoleLogs'] ?? null,
                                'networkLogs' => $run['note']['networkLogs'] ?? null,
                                'environment' => $run['note']['environment'] ?? null,
                            ]);

                            if (!$noteResult['success']) {
                                throw new \RuntimeException('Failed to create note for failed test case');
                            }
                            if (isset($noteResult['note']['id'])) {
                                $noteId = (int)$noteResult['note']['id'];
                            }
                        }
                    } else {
                        // 共有 note
                        $noteId = $sharedNoteId;
                    }
                }

                // test_run 記録
                $this->db->execute(
                    'INSERT INTO test_runs (case_id, result, note_id, env) VALUES (?, ?, ?, ?)',
                    [$caseId, $result, $noteId, $env]
                );
                $runId = $this->db->lastInsertId();

                $entry = [
                    'caseId' => $caseId,
                    'runId' => $runId,
                    'result' => $result,
                ];
                if ($noteId !== null) {
                    $entry['noteId'] = $noteId;
                }
                $results[] = $entry;
            }

            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log('submitRuns error: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Failed to submit test runs'];
        }

        // commit 後にツリー集計（失敗してもrunは記録済み）
        $capabilitySummary = null;
        if (!empty($results)) {
            try {
                $firstCaseId = $results[0]['caseId'];
                $caseInfo = $this->db->fetchOne(
                    'SELECT domain, capability FROM test_cases WHERE id = ?',
                    [$firstCaseId]
                );

                if ($caseInfo) {
                    $treeResult = $this->tree($env);
                    if ($treeResult['success']) {
                        foreach ($treeResult['data'] as $domainEntry) {
                            if ($domainEntry['domain'] === $caseInfo['domain']) {
                                foreach ($domainEntry['capabilities'] as $cap) {
                                    if ($cap['capability'] === $caseInfo['capability']) {
                                        $capabilitySummary = $cap;
                                        break 2;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                error_log('submitRuns tree error: ' . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'results' => $results,
            'capability' => $capabilitySummary,
        ];
    }
}
