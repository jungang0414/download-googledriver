# Drive File Downloader

這個專案是一個 Node.js 應用程式，用於定期從 Google Drive 下載檔案。

## 目錄結構

.gitignore
check-driver-service-account.json
index.js
package.json


## 安裝

1. 克隆這個專案到你的本地環境：
    ```sh
    git clone https://github.com/jungang0414/download-googledriver.git
    cd download-googledriver
    ```

2. 安裝所需的 npm 套件：
    ```sh
    npm install
    ```

## 配置

1. 將你的 Google Drive 服務帳戶密鑰文件放置在專案根目錄，並命名為 [check-driver-service-account.json](https://github.com/jungang0414/download-googledriver/images/create-key.PNG)。

2. 在 `index.js` 中修改成你要下載的雲端資料夾 ID 和本地存放路徑：
    ```js
    const folders = [
        { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
        // 添加更多資料夾配置
    ];
    ```

## 使用

1. 執行以下命令來啟動應用程式：
    ```sh
    npm start
    ```

2. 應用程式將每小時自動下載指定雲端資料夾中的檔案到本地存放路徑。

## 依賴

- `@google-cloud/local-auth`: ^3.0.1
- [google-auth-library](http://_vscodecontentref_/7): ^9.15.1
- `googleapis`: ^144.0.0
- `node-schedule`: ^2.1.1

## 授權

此專案使用 ISC 授權。