import { buildTable } from './bookTime.js';

document.addEventListener('DOMContentLoaded', async function () {
    const client = window.ZAFClient.init();

    window.addEventListener('message', async function (event) {
        if (event.data.type === "CHILIPIPER_SUGGESTED_TIMES") {
            try {
                const { slots, duration, userSlug, attemptId, meetingTypeSlug, timezone } = event.data.props;
                const tableHTML = buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone);
                await client.invoke('ticket.comment.appendHtml', tableHTML);
            } catch (e) {
                console.error(e);
            }
        }
    });

    client.invoke('resize', { width: '210px', height: '90px' });

    async function openPopup(event) {
        try {
            const [mainGuest, collaborators, assignee, metadata] = await Promise.all([
                client.get('ticket.requester'),
                client.get('ticket.collaborators'),
                client.get('ticket.assignee'),
                client.metadata()
            ]);

            const domain = metadata.settings?.subdomain || 'apps';
            const baseUrl = `https://${domain}.chilipiper.com/chilical-scheduler`;

            const primaryGuestEmail = mainGuest['ticket.requester']?.email || '';
            const primaryGuest = `?primaryGuest=${encodeURIComponent(primaryGuestEmail)}`;

            let guests = '&guests=';
            if (collaborators && collaborators['ticket.collaborators'].length > 0) {
                const collaboratorEmails = collaborators['ticket.collaborators']
                    .map(collaborator => collaborator.email.trim())
                    .join(',');
                guests += `${encodeURIComponent(collaboratorEmails)},`;
            }

            if (assignee && assignee['ticket.assignee']?.user?.email) {
                guests += encodeURIComponent(assignee['ticket.assignee'].user.email);
            }

            const queryParams = (event.target.id === 'suggest' || event.target.id === 'suggest_div') ? '&isSuggestedTimes=true' : '';

            const fullUrl = baseUrl + primaryGuest + guests + queryParams;

            const width = screen.width - 100;
            const height = screen.height - 200;
            const left = Math.round((screen.width - width) / 2);
            const top = Math.round((screen.height - height) / 2) - 30;
            const popupOptions = `width=${width},height=${height},left=${left},top=${top},popup=true,location=no,menubar=no,toolbar=no,scrollbars=no,resizable=yes`;

            window.open(fullUrl, 'ChiliCal Scheduler', popupOptions);

            client.invoke('app.close');
        } catch (error) {
            console.error('Error in Zendesk app:', error);
        }
    }

    const addPopupListener = (id) => document.getElementById(id)?.addEventListener('click', openPopup);

    ['schedule', 'suggest'].forEach(addPopupListener);
});
