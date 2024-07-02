# Chili Piper ChiliCal Zendesk App

This Zendesk app adds a Chili Piper ChiliCal "book meeting" button to the ticket editor icons. The button allows agents to easily schedule meetings using Chili Piper's ChiliCal Scheduler directly from within Zendesk with all ticket attendees such as requester, assignee, and collaborators. 

## Features

- Adds a Chili Piper "ChiliCal Book Meeting" button to the Zendesk ticket editor.
- Enables seamless booking of meetings using Chili Piper's ChiliCal Scheduler.
- Simplifies the process of scheduling meetings for support agents.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/chili-piper-chilical-zendesk-app.git
    ```

2. Navigate to the app directory:
    ```sh
    cd chili-piper-chilical-zendesk-app
    ```

3. Install Zendesk Command Line Interface
    ```sh
    npm install @zendesk/zcli -g
    ```

4. Package the app:
    ```sh
    zcli apps:package
    ```

5. Upload the package to your Zendesk instance:
    - Go to your Zendesk Admin Center.
    - Navigate to the "Apps" section.
    - Click "Upload App" and follow the prompts to upload the `zip` file generated in the previous step.

6. Configure the app settings as needed.

## Usage

- Open a ticket in Zendesk.
- Click the "ChiliCal Book Meeting" button in the ticket editor icons.
- Login to Chili Piper or create an account if you don't already have one.
- Follow the prompt to schedule a meeting using Chili Piper's ChiliCal Scheduler.

## Support

This app is provided as-is. Issues will largely need to be resolved on your own.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
