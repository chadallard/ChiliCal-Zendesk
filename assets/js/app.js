import { buildTable } from './bookTime.js';

document.addEventListener('DOMContentLoaded', async function () {
    const client = window.ZAFClient.init();
    client.invoke('resize', { width: '210px', height: '90px' });

    window.addEventListener('message', async function (event) {
        // this event is specific to Chili Piper app closing
        if (event.data.type === "CHILIPIPER_SUGGESTED_TIMES") {
            try {
                // build slots
                const { slots, duration, userSlug, attemptId, meetingTypeSlug, timezone } = event.data.props;

                const metadata = await client.metadata();
                const domain = metadata.settings?.subdomain || 'apps';

                // parse HTML into table
                const tableHTML = buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone, domain);
                // insert into ticket comment
                await client.invoke('ticket.comment.appendHtml', tableHTML);
            } catch (e) {
                console.error(e);
            }
        }
    });

    // Popup handler
    async function openPopup(event) {
        try {
            // Retrieve ticket data for attendees
            const [mainGuest, collaborators, assignee, metadata] = await Promise.all([
                client.get('ticket.requester'),
                client.get('ticket.collaborators'),
                client.get('ticket.assignee'),
                client.metadata()
            ]);

            // from settings
            const domain = metadata.settings?.subdomain || 'apps';
            const baseUrl = `https://${domain}.chilipiper.com/chilical-scheduler`;

            const primaryGuestEmail = mainGuest['ticket.requester']?.email.trim() || '';
            const assigneeEmail = assignee['ticket.assignee']?.user?.email.trim() || '';

            let guestsSet = new Set();
            if (collaborators && collaborators['ticket.collaborators'].length > 0) {
                collaborators['ticket.collaborators'].forEach(collaborator => {
                    const email = collaborator.email.trim();
                    if (email !== primaryGuestEmail) {
                        guestsSet.add(email);
                    }
                });
            }

            // ensure assignee is not also in the list of guests
            if (assigneeEmail && assigneeEmail !== primaryGuestEmail) {
                guestsSet.add(assigneeEmail);
            } else {
                guestsSet.delete(assigneeEmail);
            }

            const guests = guestsSet.size > 0 ? `&guests=${encodeURIComponent(Array.from(guestsSet).join(','))}` : '';

            const primaryGuest = `?primaryGuest=${encodeURIComponent(primaryGuestEmail)}`;

            // determine if we are supposed to be inserting times
            const queryParams = (event.target.id === 'suggest' || event.target.id === 'suggest_div') ? '&isSuggestedTimes=true' : '';

            const fullUrl = baseUrl + primaryGuest + guests + queryParams;

            // window params
            const width = screen.width - 100;
            const height = screen.height - 200;
            const left = Math.round((screen.width - width) / 2);
            const top = Math.round((screen.height - height) / 2) - 30;
            const popupOptions = `width=${width},height=${height},left=${left},top=${top},popup=true,location=no,menubar=no,toolbar=no,scrollbars=no,resizable=yes`;

            // init popup
            window.open(fullUrl, 'ChiliCal Scheduler', popupOptions);
            // close widget iframe
            client.invoke('app.close');
        } catch (error) {
            console.error('Error in Zendesk app:', error);
        }
    }
    // listen for clicks on the schedule and suggest buttons
    const addPopupListener = (id) => document.getElementById(id)?.addEventListener('click', openPopup);
    ['schedule', 'suggest'].forEach(addPopupListener);

});
