FROM php:8.4-cli

# SQLite3 開発パッケージをインストール
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 必要な拡張機能をインストール
RUN docker-php-ext-install pdo pdo_sqlite

# 作業ディレクトリ
WORKDIR /var/www/api

# 添付ファイル用ディレクトリ作成
RUN mkdir -p /var/www/api/data/attachments && \
    chown -R www-data:www-data /var/www/api/data

# ポート公開
EXPOSE 8080

# PHPビルトインサーバー起動
CMD ["php", "-S", "0.0.0.0:8080", "-t", "/var/www/api"]
