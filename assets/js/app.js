import { buildTable } from './bookTime.js';
import { getFocus } from './utils.js';

// create function to repeatedly get focus for document


document.addEventListener('DOMContentLoaded', async function () {
    const client = window.ZAFClient.init();

    window.addEventListener('message', async function (event) {

        if (event.data.type === "CHILIPIPER_COPY_TIMES_TO_CLIPBOARD") {
            try {

                await getFocus();

                const data = event.data.props;

                const slots = data.slots;
                const duration = data.duration;
                const userSlug = data.userSlug;
                const attemptId = data.attemptId;
                const meetingTypeSlug = data.meetingTypeSlug;
                const timezone = data.timezone;

                const tableHTML = buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone);
                console.log(tableHTML)

                await window.navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': new Blob([tableHTML], { type: 'text/html' })
                    })
                ]);
            } catch (e) {
                console.error(e)
            }
            const data = event.data.props;
        }
    });

    client.invoke('resize', { width: '210px', height: '90px' });

    async function openPopup(event) {
        try {
            const mainGuest = await client.get('ticket.requester');
            const collaborators = await client.get('ticket.collaborators');
            const assignee = await client.get('ticket.assignee');

            // build initial URL
            const metadata = await client.metadata();
            const domain = metadata.settings?.subdomain || 'apps';
            const baseUrl = `https://${domain}.chilipiper.com/chilical-scheduler`;

            // Extract primary guest email
            const primaryGuest = `?primaryGuest=${encodeURIComponent(mainGuest['ticket.requester']?.email || '')}`;

            // Extract collaborator emails and create a comma-separated list
            let guests = '&guests=';
            if (collaborators && collaborators['ticket.collaborators'].length > 0) {
                const collaboratorEmails = collaborators['ticket.collaborators'].map(collaborator => collaborator.email.replace(/\s/g, '')).join(',');
                guests += `${encodeURIComponent(collaboratorEmails)},`;
            }

            if (assignee && assignee['ticket.assignee'] && assignee['ticket.assignee']?.user?.email) {
                guests += encodeURIComponent(assignee['ticket.assignee'].user.email);
            }

            // Determine query parameters based on button clicked
            let queryParams = '';
            if (event.target.id === 'suggest' || event.target.id === 'suggest_div') {
                queryParams = '&isSuggestedTimes=true&isCopyToClipboard=true';
            }

            // Construct full URL with optional query parameters
            const fullUrl = baseUrl + primaryGuest + guests + queryParams;

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
    }

    // Add event listeners for the buttons
    document.getElementById('schedule').addEventListener('click', openPopup);
    document.getElementById('suggest').addEventListener('click', openPopup);
});
