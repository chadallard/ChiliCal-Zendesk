document.addEventListener('DOMContentLoaded', async function () {
    const client = ZAFClient.init();

    // Resize pane (optional)
    client.invoke('resize', { width: '0px', height: '0px' });

    client.on('pane.activated', async function () {
        try {
            const baseUrl = 'https://apps.chilipiper.com/chilical-scheduler/';
            const mainGuest = await client.get('ticket.requester');
            const collaborators = await client.get('ticket.collaborators');
            const assignee = await client.get('ticket.assignee');

            // Extract primary guest email
            const primaryGuest = `?primaryGuest=${encodeURIComponent(mainGuest['ticket.requester']?.email || '')}`;

            // Extract collaborator emails and create a comma-separated list
            let guests = '';
            if (collaborators && collaborators['ticket.collaborators'].length > 0) {
                const collaboratorEmails = collaborators['ticket.collaborators'].map(collaborator => collaborator.email.replace(/\s/g, '')).join(',');
                guests = `&guests=${encodeURIComponent(collaboratorEmails)}`;
            }

            if (assignee && assignee['ticket.assignee'] && assignee['ticket.assignee']?.user?.email) {
                guests += `${encodeURIComponent(","+assignee['ticket.assignee'].user.email)}`;
            }


            // Construct full URL
            const fullUrl = baseUrl + primaryGuest + guests;

            // Calculate popup dimensions and position
            const width = screen.width - 100;
            const height = screen.height - 200;
            const left = Math.round((screen.width - width) / 2);
            const top = Math.round((screen.height - height) / 2) - 30;
            const popupOptions = `width=${width},height=${height},left=${left},top=${top},popup=true,location=no,menubar=no,toolbar=no,scrollbars=no,resizable=yes`;

            // Open popup window with specified options
            window.open(fullUrl, 'ChiliCal Scheduler', popupOptions);

            // Close the Zendesk app
            client.invoke('app.close');
        } catch (error) {
            console.error('Error in Zendesk app:', error);
        }
    });
});
