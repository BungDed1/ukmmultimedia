// ... (Kode Aspect Ratio Calc kemarin) ...

function calculateFileSize() {
    const duration = document.getElementById('vidDuration').value;
    const bitrate = document.getElementById('vidBitrate').value;
    const resultDisplay = document.getElementById('resultSize');

    if (duration > 0) {
        // Rumus: (Bitrate Mbps * Durasi Detik) / 8 = Megabytes (MB)
        let sizeInMB = (bitrate * duration) / 8;

        if (sizeInMB >= 1024) {
            let sizeInGB = (sizeInMB / 1024).toFixed(2);
            resultDisplay.innerText = `${sizeInGB} GB`;
        } else {
            resultDisplay.innerText = `${Math.round(sizeInMB)} MB`;
        }
    } else {
        resultDisplay.innerText = "0 MB";
    }
}