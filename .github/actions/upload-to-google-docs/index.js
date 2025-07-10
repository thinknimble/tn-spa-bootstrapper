const { google } = require('googleapis');
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // Inputs from the GitHub Action workflow
    const credentials = JSON.parse(core.getInput('credentials', { required: true }));
    const filePath = core.getInput('file-path', { required: true });
    const documentId = core.getInput('document-id'); // Optional: for updating an existing doc
    const folderId = core.getInput('folder-id'); // Optional: for creating a new doc in a specific folder
    const documentTitle = core.getInput('document-title') || path.basename(filePath);

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Prepare the file for upload
    const fileMetadata = {
      name: documentTitle,
      mimeType: 'application/vnd.google-apps.document',
    };

    const media = {
      mimeType: 'text/plain', // Assuming a plain text file, adjust if needed
      body: fs.createReadStream(filePath),
    };

    if (documentId) {
      // Update an existing document
      console.log(`Updating document: ${documentId}`);
      const response = await drive.files.update({
        fileId: documentId,
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink',
      });
      console.log('Document updated successfully!');
      core.setOutput('documentId', response.data.id);
      core.setOutput('webViewLink', response.data.webViewLink);
    } else {
      // Create a new document
      if (folderId) {
        fileMetadata.parents = [folderId];
      }
      console.log(`Creating a new document titled: "${documentTitle}"`);
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink',
      });
      console.log('Document created successfully!');
      core.setOutput('documentId', response.data.id);
      core.setOutput('webViewLink', response.data.webViewLink);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    if (error.errors) {
        error.errors.forEach(e => {
            console.error(`- ${e.domain}: ${e.reason} - ${e.message}`);
        });
    }
  }
}

run();
