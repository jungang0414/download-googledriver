const fs = require('fs').promises; // 使用 fs.promises
const path = require('path');
const { google } = require('googleapis');
// 驗證服務帳戶
const { GoogleAuth } = require('google-auth-library');
const scheduld = require('node-schedule');

// API 服務
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'check-driver-service-account.json'); // 服務帳戶密鑰文件的路徑

/**
 * 載入請求或授權並呼叫API
 * Load or request or authorization to call APIs.
 */
async function authorize() {
    const auth = new GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    return await auth.getClient();
}

/**
 * 列出檔案名稱. 參數: 獲授權的OAuth2用戶端, 雲端資料夾ID, 檔案下載後存放的路徑
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 * @param {string} folderId The ID of the folder to list files from.
 * @param {string} targetFolderPath The path to the folder where files will be downloaded.
 */
async function listFiles(authClient, folderId, targetFolderPath) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const res = await drive.files.list({
        q: `'${folderId}' in parents`,
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, createdTime, modifiedTime)',
    });
    const files = res.data.files;
    if (files.length === 0) {
        console.log('No files found.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Files:');
    const filteredFiles = files.filter(file => {
        const modifiedTime = new Date(file.modifiedTime);
        const createdTime = new Date(file.createdTime);
        return createdTime >= today || modifiedTime >= today;
    });

    filteredFiles.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });

    // 下載過濾後的所有文件
    // Download all filtered files in the list
    for (const file of filteredFiles) {
        const destPath = path.join(targetFolderPath, file.name);
        try {
            await fs.access(destPath);
            console.log(`File ${file.name} already exists. Skipping download.`);
        } catch (err) {
            await downloadFile(authClient, file.id, file.name, targetFolderPath);
        }
    }
}

/**
 * 下載雲端硬碟中的檔案 參數: 獲授權的OAuth2用戶端, 雲端資料夾ID, 下載的檔案名稱, 存放路徑
 * Downloads a file from Google Drive.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 * @param {string} fileId The ID of the file to download.
 * @param {string} destFileName The name of the destination file.
 * @param {string} targetFolderPath The path to the folder where the file will be downloaded.
 */
async function downloadFile(authClient, fileId, destFileName, targetFolderPath) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const destPath = path.join(targetFolderPath, destFileName);
    const dest = require('fs').createWriteStream(destPath);

    const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
        res.data
            .on('end', () => {
                console.log(`Downloaded ${destFileName} to ${targetFolderPath}`);
                resolve();
            })
            .on('error', (err) => {
                console.error('Error downloading file.');
                reject(err);
            })
            .pipe(dest);
    });
}

/**
 * 清除資料夾檔案 (已停用)
 * Clears all files in the specified folder.
 * @param {string} folderPath The path to the folder to clear.
 */
async function clearFolder(folderPath) {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        await fs.unlink(filePath);
    }
}

// 欲下載的雲端資料夾. 資料夾ID, 下載存放路徑
const folders = [
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
    { id: '雲端資料夾ID', path: '//DStation/欲下載存放的資料夾名稱' },
];

// 下載函數
async function downloadFilesPeriodically() {
    const authClient = await authorize();
    for (const folder of folders) {
        await listFiles(authClient, folder.id, folder.path);
    }
}

// 透過 node-schedule 排程自動下載
// scheduleJob('分 時 日 月 週', 執行函數);
scheduld.scheduleJob('0 * * * *', downloadFilesPeriodically)

// 執行程式時立即執行一次下載操作
downloadFilesPeriodically().catch(console.error);