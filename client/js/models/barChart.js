/**
 * Created by agirmar on 20.3.2016.
 */
window.onload = function () {
    CanvasJS.addCultureInfo("is",
        {
            digitGroupSeparator: "."

        });

    var chart = new CanvasJS.Chart("miniChartContainer",
        {
            /*title:{
             text: "Samanburður gjalda og tekna"
             },*/
            data: [
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 111338 , label: "Gjöld", color: "#0dad5c"},
                        {  y: 1000000, label: "Tekjur" }
                    ]
                },  {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#ff906d"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#5594ba"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#90e662"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#ffbd6d"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#f16785"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#e6fa6b"}
                    ]
                },
                {
                    type: "stackedColumn",
                    axisYType: "secondary",
                    dataPoints: [
                        {  y: 135305 , label: "Gjöld", color: "#b352bd"}
                    ]
                }
            ],
            backgroundColor: "transparent",
            toolTip: {
                enabled: false
            },
            culture: "is",
            axisY2: {
                gridThickness: 0,
                labelFontSize: 12,
                labelAngle: 50,
                valueFormatString: "#,###,### kr."
            },
            axisX: {
                labelFontSize: 14
            },
            animationEnabled: true
        });

    chart.render();
}