const gapi = require('gapi');

gapi.server.setApiKey('AIzaSyAGxPZ2U94DQX87michIJBXUNaRnPKCkKM');

function deleteFile(file_id) {
    var request = gapi.client.drive.files.delete({
        supportsTeamDrives: 'false',
        fileId: file_id,
    });
    request.execute(function(resp) {});
}

deleteFile('1hIIxR9BO9sLxStcgmOOxpvBwPCNMFif8');