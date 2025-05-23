document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const linkContainer = document.getElementById('linkContainer');
    const downloadLink = document.getElementById('downloadLink');
    const copyBtn = document.getElementById('copyBtn');
    const message = document.getElementById('message');

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        message.textContent = '';
        linkContainer.style.display = 'none';
        const files = fileInput.files;
        if (!files.length) {
            message.textContent = 'Please select a ZIP file.';
            return;
        }
        const file = files[0];
        if (!file.name.endsWith('.zip')) {
            message.textContent = 'Only ZIP files are allowed.';
            return;
        }
        const formData = new FormData();
        // Only support single file upload for now
        formData.append('file', file);
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        fetchUpload(formData);
    });

    function fetchUpload(formData) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5000/upload', true);
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = percent + '%';
            }
        };
        xhr.onload = function() {
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                const link = window.location.origin.replace(/:\d+$/, ':5000') + res.downloadLink;
                downloadLink.value = link;
                linkContainer.style.display = 'flex';
                message.textContent = 'File uploaded successfully!';
            } else {
                message.textContent = xhr.responseText || 'Upload failed.';
            }
        };
        xhr.onerror = function() {
            message.textContent = 'Network error.';
        };
        xhr.send(formData);
    }

    copyBtn.addEventListener('click', function() {
        downloadLink.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 1200);
    });
});