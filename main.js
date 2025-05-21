// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded. Embedding Vega-Lite charts.");

    // Function to load and embed a Vega-Lite spec
    function embedChart(divId, specUrl) {
        fetch(specUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(spec => {
                // Use vegaEmbed to embed the spec into the target div
                vegaEmbed(`#${divId}`, spec, { actions: true }) // actions:true includes export links
                    .then(result => console.log(`Successfully embedded ${specUrl} into #${divId}`))
                    .catch(error => console.error(`Error embedding ${specUrl}:`, error));
            })
            .catch(error => console.error(`Error fetching ${specUrl}:`, error));
    }

    // Embed each chart into its corresponding div
    // Use the IDs defined in index.html and the filenames saved by the notebook
    embedChart('vis-monthly-boxplot', 'specs/monthly_boxplot.json');
    embedChart('vis-cycles-trend-linked', 'specs/cycles_trend_linked.json');
    embedChart('vis-choropleth-linked-bars', 'specs/choropleth_linked_bars.json');
    embedChart('vis-timeseries-scatter-linked', 'specs/timeseries_scatter_linked.json');
    embedChart('vis-soil-precip-interactive', 'specs/soil_precip_interactive.json');
    embedChart('vis-soil-precip-lag-correlation', 'specs/soil_precip_lag_correlation.json');
    embedChart('vis-temp-wind-scatter', 'specs/temp_wind_scatter.json');
    embedChart('vis-faceted-slider',     'specs/faceted_slider.json');

});
