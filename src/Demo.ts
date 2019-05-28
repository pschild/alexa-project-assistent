import { JiraEndpointController } from './endpoint/jira/JiraEndpointController';
import { Inject } from 'typescript-ioc';
import { ILineChartDataItem, LineChartController } from './media/LineChartController';
import { BarChartController, IBarChartDataItem } from './media/BarChartController';

export default class Demo {

    @Inject
    private controller: JiraEndpointController;

    @Inject
    private lineChartController: LineChartController;

    @Inject
    private barChartController: BarChartController;

    public async generateBurndownChart(): Promise<string> {
        let { burndownData, idealData } = await this.controller.getDemoBurndownData();
        burndownData = burndownData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));
        idealData = idealData.map(row => ({ key: new Date(row.key), value: row.value / 3600 }));

        const chartData: ILineChartDataItem[] = [
            { name: 'burndownData', values: burndownData, isStepped: true },
            { name: 'idealData', values: idealData }
        ];
        const lineChartUrl = await this.lineChartController
            .setLineColors(['#d04437', '#999'])
            .generateChart(chartData).catch((e) => {
                throw new Error(`Ich konnte das Diagramm nicht finden. Bitte versuche es erneut.`);
            });
        return lineChartUrl
            .replace(`https://localhost`, `http://localhost:4242`);
    }

    public async generateVelocityChart(): Promise<string> {
        const data: IBarChartDataItem[] = await this.controller.getDemoVelocityData();
        const chartData = data.map(bar => ({ key: bar.key, value: (+bar.value / 3600 / 8), styles: bar.styles}));
        const chartUrl = await this.barChartController
            .setYAxisUnit('PT')
            .generateChart(chartData).catch((e) => {
                throw new Error(`Ich konnte das Diagramm nicht erstellen. Bitte versuche es erneut.`);
            });
        return chartUrl
            .replace(`https://localhost`, `http://localhost:4242`);
    }
}
