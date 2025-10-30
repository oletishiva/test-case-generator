"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJira = registerJira;
function registerJira({ router }) {
    router.post('/jira/fetch', async (req, res) => {
        try {
            const { storyId } = req.body;
            if (!storyId || typeof storyId !== 'string') {
                return res.status(400).json({ success: false, error: 'JIRA Story ID is required' });
            }
            const mockJiraStory = {
                id: storyId,
                title: `Sample JIRA Story: ${storyId}`,
                status: 'In Progress',
                priority: 'High',
                description: 'This is a sample JIRA story description that would normally be fetched from the JIRA API.',
                acceptanceCriteria: `Given a user wants to ${storyId.toLowerCase().replace('-', ' ')}\nWhen they perform the action\nThen they should see the expected result\n\nAdditional criteria:\n- The system should handle errors gracefully\n- Performance should be under 2 seconds\n- The UI should be responsive`,
            };
            res.status(200).json({ success: true, story: mockJiraStory });
        }
        catch (error) {
            console.error('❌ Error fetching JIRA story:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch JIRA story' });
        }
    });
}
//# sourceMappingURL=jira.js.map