export class JiraIssueAssignee {
    displayName: string;
    avatarUrls: any[];

    getFullName() {
        const nameParts = this.displayName.split(',');
        return `${nameParts[1]} ${nameParts[0]}`;
    }
}
