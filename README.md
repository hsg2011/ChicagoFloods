# Assignment 4: Interactive Visualization System

**Team Members:** [Ameen Zaita, Harket, Darius Wilson]

**Link to Live Visualization:** (https://ameenzaita.github.io/424-website-/)

**Image of Visual Interface:** ![image](https://github.com/user-attachments/assets/f7cf577a-b19d-4d98-9855-12d0d28d1416)
- Note: Only displaying 1 graph since the graphs are displayed vertically so the others are not in view

## 1) Dataset Description

The dataset used for this project is the Chicago Environmental Sensors Data, obtained from the City of Chicago Data Portal (Source: [https://data.cityofchicago.org/Environmental-Health/Environmental-Sensors-Data/ggws-77ih](https://data.cityofchicago.org/Environmental-Health/Environmental-Sensors-Data/ggws-77ih)). This dataset comprises timestamped measurements from a network of environmental sensors deployed across various locations in Chicago.

We focused our analysis on data collected during the period from **January 1, 2017, to June 30, 2017**, capturing the transition from winter through spring and into early summer. The dataset includes various `measurement_type` values, but we specifically focused on:

*   `Temperature` (°C)
*   `RelativeHumidity` (%)
*   `CumulativePrecipitation` (mm)
*   `SoilMoisture` (%)
*   `WindSpeed` (m/s)

Key attributes utilized from the dataset include `measurement_time`, `measurement_type`, `measurement_value`, `units`, `measurement_title` (for sensor-specific handling), `data_stream_id` (for precipitation calculation), `latitude`, and `longitude`.

## Domain Questions Addressed

The primary goal was to leverage interactive visualization to explore key environmental patterns and relationships in Chicago during this transitional period. The visualizations are designed to help answer the following questions:

1.  How do temperature patterns in Chicago evolve during the winter-to-spring transition period? (Addressed by V1, V4)
2.  How do environmental sensors in Chicago capture spatial variations in temperature? (Addressed by V2)
3.  What relationships exist between temperature, humidity, and precipitation in Chicago? (Addressed by V3)
4.  How does soil moisture respond to precipitation events in Chicago? (Addressed by V5)
5.  How do wind patterns vary across different parts of Chicago, and how do they correlate with temperature? (Addressed by V6)
6.  How do daily cycles of temperature and humidity change throughout the winter-to-spring transition? (Addressed by V4)

## Data Transformations and Preprocessing

The raw data required several steps of cleaning, transformation, and aggregation before visualization:

1.  **Data Acquisition and Initial Combination:** Data was fetched from the City of Chicago API and combined into a single Pandas DataFrame. Initial duplicate records were removed.
2.  **Type Conversion:** Essential columns (`measurement_time`, `measurement_value`, `latitude`, `longitude`) were converted to appropriate data types (datetime, numeric). Non-standard data representations, like dictionary strings, were handled by converting them to simple strings.
3.  **Missing Value and Outlier Handling:** Rows missing critical information (time, location, value, type) were removed. Significant outliers in `measurement_value` were identified and removed using either interquartile range (IQR) based filtering or month-specific plausible ranges, especially for temperature.
4.  **Temperature Sensor Correction:** An important step involved correcting temperature values reported by specific sensor types (e.g., MK-III, Cumulus, TM1) that appeared to report raw voltage or scaled values rather than direct Celsius readings. Heuristics and approximate conversion formulas (like (mV - 400) / 19.5 for TM1) were applied to convert these values into realistic Celsius estimates.
5.  **Spatial Data Integration:** GeoJSON data for Chicago community areas (neighborhoods) was obtained and loaded using GeoPandas. Sensor locations (latitude/longitude) were converted into GeoDataFrames.
6.  **Aggregation for Time Series and Relationships:**
    *   Hourly mean and standard deviation temperatures were calculated per month.
    *   Daily mean temperatures, humidity, soil moisture, and wind speeds were calculated by averaging measurements within each day.
    *   Daily precipitation totals were calculated by taking the maximum cumulative precipitation value per sensor per day, calculating the difference from the previous day (handling sensor resets), and summing these changes across all sensors for that day. Values were converted from millimeters to inches.
    *   Soil moisture data was optionally scaled if maximum values were unrealistically high (>100).
    *   Lagged daily precipitation values were computed to analyze the temporal response of soil moisture.
7.  **Aggregation for Spatial View:** Temperature sensor data was spatially joined with neighborhood polygons to determine which neighborhood each sensor reading fell within. Daily mean, minimum, and maximum temperatures were then aggregated per neighborhood for each month.
8.  **Data Export for Web:** The cleaned, aggregated, and transformed data (including daily aggregates, hourly aggregates, neighborhood aggregates, and lagged data) and the neighborhoods GeoJSON were saved as separate JSON files in a `./data/` subdirectory.
9.  **Altair Specification Export:** Each visualization was created as an Altair chart object in Python. The `.to_json()` method was used to export the Vega-Lite specification for each chart into a `./specs/` subdirectory. These JSON files contain the full description of the chart, including data references (pointing to the files in `./data/`) and interaction definitions.

## Visualizations and Interactions

The web interface (`index.html`) loads the Vega-Lite specifications from the `./specs/` folder and embeds them using `vegaEmbed.js`. The layout is managed by `style.css`. The visualizations are designed to be interactive, allowing dynamic exploration of the data.

---

### V1: Monthly Temperature Distribution (Mar-Jun 2017)

*   **Domain Questions:** DQ1, DQ6
*   **Data Source:** `data/monthly_temp_for_boxplot.json` (Temperature measurements, filtered for Mar-Jun, after cleaning and sensor correction).
*   **Visual Mapping:** Shows the spread of temperature values for each month using boxplots.
    *   X-axis: Month name (`month_name:N`) - ordered categorically (March, April, May, June).
    *   Y-axis: Temperature value (`measurement_value:Q`) - Quantitative.
    *   Color: Encodes month name (`month_name:N`) to differentiate distributions.
*   **Assignment Task:** Part of fulfilling Task 3 (Visualizations). While not explicitly interactive in this form, it is a single view providing crucial distributional context for DQ1 and DQ6.

![Animation1(424)](https://github.com/user-attachments/assets/9ff1f471-b7d7-437d-b87e-dbd085ba50b4)
![image](https://github.com/user-attachments/assets/4d0e0b5e-0fe2-4195-bdc6-691fd03b9024)
*(Screenshot and gif of the Monthly Temperature Distribution Boxplots for March-June 2017. Clearly shows the upward trend and widening range of temperatures.)*

### Key Findings
There is a significant upward trend in temperature from March to June. The median temperature increases substantially each month, and the overall range and variability (shown by the box height and whiskers) also tend to increase as the season progresses into summer. (Addresses DQ1, DQ6)


### Motivation & Rationale

By visualizing the spread of temperatures across March to June:
- It reveals changes in **median temperatures** and **variability** over time.
- It shows that **March is colder and more variable**, while **June has higher, more consistent temperatures**.
- Boxplots offer a compact summary of the range and central tendency of temperatures for each month.

---

### Interaction Mechanisms

- While the Vega-Lite chart itself is **static** in this implementation, it supports:
  - **Tooltips** for summary stats per box

---

### Design Decisions

- **Boxplot Mark Type**: Chosen for its effectiveness in visualizing distribution and outliers
- **Month Order**: Custom categorical ordering (`March → June`) to reflect seasonal progression
- **Color Encoding**:
  - Each month is assigned a distinct color
- **Median Line in White**:
  - Enhances contrast and visibility, especially against colored boxes
- **Chart Dimensions**: Optimized for readability
- **Title and Axis Labels**: Clear and informative to support standalone interpretation

---

### Experimentation Process

Several alternatives were explored before finalizing this chart:

1. **Raw Line Chart for All Days**  
   - Too noisy for over 180+ days; lacked summary power

2. **Histograms per Month**  
   - Didn’t allow easy comparison across months

3. **Violin Plots**  
   - More detailed but less supported and more visually complex

4. **Interactive Filtering**  
   - Considered filters for year and measurement type, but not important for this focused timeframe

5. **Outlier Treatment**  
   - Sensor range filters were applied to remove unrealistic data points (based on monthly constraints)

6. **Sampling Strategy**  
   - Stratified sampling per month (`min(len(x), 1000)`) was used to reduce rendering load while maintaining data points

---

### V2: April Temperature by Neighborhood (Linked Choropleth + Bars)

*   **Domain Questions:** DQ2, DQ1 (for April)
*   **Data Source:** `data/chicago_neighborhoods.json` (GeoJSON for map shapes) and `data/neighborhood_temps.json` (Aggregated neighborhood temperatures for lookup).
*   **Visual Mapping:** A linked view presenting spatial variation and neighborhood-specific details.
    *   **Map (Top Panel):**
        *   Geoshape: Chicago neighborhood polygons (`geojson.features`).
        *   Color: Mean temperature (`properties.mean_temp:Q`) for April (Quantitative, diverging 'redblue' scale). Selected neighborhood is highlighted.
        *   Tooltip: Shows 'Neighborhood', 'Mean Temp (°C)', 'Min Temp (°C)', 'Max Temp (°C)' for April.
    *   **Bar Chart (Bottom Panel):**
        *   X-axis: Temperature Metric (`temp_metric:N`) - Categorical (Min, Mean, Max).
        *   Y-axis: Temperature Value (`temp_value:Q`) - Quantitative.
        *   Color: Maps metric type to distinct colors.
        *   Tooltip: Shows 'Neighborhood', 'Metric', 'Value (°C)'.
*   **Interaction:** A single selection (`selection_single`) on the map allows a user to click a neighborhood. This interaction filters the data shown in the bar chart to display only the temperature metrics for the selected neighborhood. Clicking away deselects.
*   **Findings:** Spatial variations in temperature exist across Chicago neighborhoods in April. Some neighborhoods (e.g., potentially near the lake or further inland) may show slightly different mean temperatures. Selecting a specific neighborhood provides a detailed view of its temperature range (min, mean, max) for the month. (Addresses DQ2)
*   **Assignment Task:** Fulfills Task 3 (Multiple Linked View) and task 5. It coordinates two views using a click selection to filter data in the secondary view.

![Animation(neighborhood)](https://github.com/user-attachments/assets/7829f658-6269-4648-b39c-8a1b53b086b8)
![image](https://github.com/user-attachments/assets/0a633074-17cc-4340-9208-4ac656d6ca29)
*(Screenshot and gif of the linked view showing mean temperature by neighborhood in April (map) and temperature metrics for a selected neighborhood (bars).)*

### Experimentation Process

Several iterations were explored:

1. **Standalone Map and Chart**  
   - Originally separated map and bar chart without linking  
   - Lacked interactivity and connection between views

2. **Tooltip-Only Approach**  
   - Tooltips were not sufficient to support **side-by-side comparison**

3. **Linked Chart Enhancements**  
   - Tried using a scatterplot for bar view, but bars offered better clarity and layout control
   - Added **conditional formatting**, **opacity effects**, and **clean padding** for clarity

4. **Color Tuning & Accessibility**  
   - Reversed `redblue` chosen for intuitive temperature mapping  
   - Manually tuned colors for bar chart metrics to maintain visibility and contrast

---

### V3: March Temp vs. Humidity Relationship (Linked Time Series -> Scatter Filter)

*   **Domain Questions:** DQ3
*   **Data Source:** `data/daily_env_march.json` (Daily average temperature, humidity, and precipitation for March).
*   **Visual Mapping:** A linked view combining time series trends and a scatter plot relationship.
    *   **Time Series (Top Panel):**
        *   X-axis: Date (`day:T`) - Temporal. Formatted to show day of week and day number.
        *   Y-axis (Left): Temperature (`temperature:Q`) - Quantitative (Red line).
        *   Y-axis (Right): Relative Humidity (`humidity:Q`) - Quantitative (Blue line).
        *   Supports interval brushing on the X-axis.
    *   **Scatter Plot (Bottom Panel):**
        *   X-axis: Temperature (`temperature:Q`) - Quantitative.
        *   Y-axis: Relative Humidity (`humidity:Q`) - Quantitative.
        *   Points: Represent individual days (`mark_point`, green).
        *   Tooltip: Shows 'Date', 'Temp (°C)', 'Humidity (%)', 'Precip (in)'.
*   **Interaction:** An interval selection (`selection_interval`) on the X-axis of the Time Series plot (brushing) filters the data points displayed in the Scatter Plot. This allows users to examine the temperature-humidity relationship specifically during cold periods, warm periods, or periods with notable changes.
*   **Findings:** Daily average temperature and relative humidity generally show an inverse relationship in March (as temperature rises, humidity tends to fall, and vice versa). Brushing specific periods on the time series allows examining how this relationship holds during distinct weather events (e.g., during a cold snap or a warm front). (Addresses DQ3)
*   **Assignment Task:** Fulfills Task 3 (Multiple Linked View).

![Animation12424)](https://github.com/user-attachments/assets/db2b3601-1b69-421c-8730-d1d12664cb53)
![image](https://github.com/user-attachments/assets/11dee89c-1c6d-4a23-adc1-ec0b07c9b618)
*(Screenshot and gif of the linked view showing temperature and humidity trends over time (top) and the relationship between daily temperature and humidity (bottom). Brushing the top chart filters points in the bottom chart.)*

---

### V4: Daily Temperature Cycles & Trend (Linked Cycles -> Trend Filter)

*   **Domain Questions:** DQ6
*   **Data Source:** `data/hourly_temp_cycles.json` (Hourly mean/std temp by month) and `data/daily_temp_trend.json` (Daily mean/min/max temp trend).
*   **Visual Mapping:** A linked view showing typical daily patterns and overall seasonal trend.
    *   **Daily Cycles (Top Panel):**
        *   X-axis: Hour of Day (`hour:O`) - Ordinal (0-23).
        *   Y-axis: Temperature (`mean_temp:Q` and `lower_band:Q`, `upper_band:Q`) - Quantitative. Shows mean line and +/- 1 Std Dev band.
        *   Color: Maps Month name (`month_name:N`) to distinct colors, highlighting the shift in cycles Mar-Jun.
        *   Tooltip: Shows Month, Hour, Avg Temp, Std Dev.
    *   **Daily Trend (Bottom Panel):**
        *   X-axis: Date (`day:T`) - Temporal.
        *   Y-axis: Daily Average Temperature (`mean_temp:Q`) - Quantitative.
        *   Line and Points: Show the daily average temperature over time.
        *   Tooltip: Shows Date, Month, Avg Temp, Min Temp, Max Temp.
*   **Interaction:** A point selection (`selection_point`) on the `month_name` field (triggered by clicking a line or its legend entry) in the Daily Cycles chart filters the data displayed in the Daily Trend chart to show only the selected month. This allows users to see the day-to-day variations *within* a specific month whose typical cycle they've just observed.
*   **Findings:** The typical daily temperature pattern (the 24-hour cycle) changes significantly from March to June. Later months have much warmer nighttime lows and higher daytime highs, leading to a higher average temperature throughout the day. Selecting a month shows the actual day-to-day progression of temperature within that period, confirming the overall warming trend. (Addresses DQ6)
*   **Assignment Task:** Part of fulfilling Task 6 (Formal Description - view coordination addressing a DQ). It coordinates two views using a click selection to filter data.

![Animation1233424)](https://github.com/user-attachments/assets/15df3bf9-3c40-4d3e-8f01-a9d0bd081fc7)
![image](https://github.com/user-attachments/assets/05881651-255d-422d-a095-6a5ac1af7dd6)
*(Screenshot and gif of the linked view showing average daily temperature cycles by month (top) and the daily temperature trend filtered by the selected month (bottom).)*

### V5: Soil Moisture Response to Precipitation & Lag Correlation

*   **Domain Questions:** DQ4
*   **Data Source:** `data/daily_soil_precip.json` (Daily soil moisture and precipitation) and `data/soil_precip_lag_correlation.json` (Calculated correlation coefficients).
*   **Visual Mapping:** Two separate charts focusing on different aspects of DQ4.
    *   **Interactive Time Series (Focus + Context):**
        *   **Detail Panel (Top):** Line chart of Daily Soil Moisture (`soil_moisture:Q`) vs Date (`day:T`). Y-axis in saddlebrown.
        *   **Context Panel (Bottom):** Bar chart of Daily Precipitation (`precipitation:Q`) vs Date (`day:T`). Y-axis in steelblue. X-axis is shared and supports brushing.
        *   Tooltip: Shows Date and value for each metric.
    *   **Lag Correlation Plot:**
        *   X-axis: Lag in Days (`lag:O`) - Ordinal.
        *   Y-axis: Correlation Coefficient (`correlation:Q`) - Quantitative.
        *   Line and Points: Show correlation between Soil Moisture and Precipitation lagged by the given number of days.
        *   Reference Line: Horizontal rule at Y=0.
        *   Text Annotation: Indicates the lag with the highest correlation.
        *   Tooltip: Shows Lag and Correlation value.
*   **Interaction:**
    *   **Time Series:** Brushing on the X-axis of the Precipitation (context) chart zooms and filters the Soil Moisture (detail) chart to show the corresponding time period, allowing close inspection of soil moisture changes after rain events.
    *   **Lag Correlation:** Static view.
*   **Findings (Time Series):** Soil moisture levels tend to increase visibly and often sharply following precipitation events. The interactive brush allows focusing on periods immediately after rain to observe this response.
*   **Findings (Lag Correlation) :** There is a measurable delay between precipitation and the peak increase in soil moisture. The highest correlation is typically found at a lag of 1 or 2 days, indicating that it takes some time for rainfall to infiltrate and significantly impact the measured soil moisture.
*   **Assignment Task:** This combination of visualizations directly addresses DQ4. The interactive time series uses a focus+context design driven by brushing.

![Animation123783424)](https://github.com/user-attachments/assets/dd468ac4-727b-43fc-9070-124965a22ce3)
![image](https://github.com/user-attachments/assets/00a97be8-0fcf-4636-b6e2-ec5f9673aef5)
*(Screenshot and gif of the interactive time series showing daily soil moisture (top) and precipitation (bottom). Brushing the precipitation chart zooms the soil moisture chart.)*

---

![Animation2323](https://github.com/user-attachments/assets/9728c313-3eaf-4da6-9303-d8ac4766f9ee)
![image](https://github.com/user-attachments/assets/4dc8e487-a8b4-4770-a115-9cf00502a9cb)
*(Screenshot and gif of the correlation between soil moisture and precipitation at different time lags, indicating the typical response time.)*

### V6: Temperature vs. Wind Speed (March 2017)

*   **Domain Questions:** DQ5
*   **Data Source:** `data/temp_wind_daily.json` (Daily average temperature and wind speed for March).
*   **Visual Mapping:** Scatter plot exploring the relationship between two variables.
    *   X-axis: Temperature (`measurement_value_temp:Q`) - Quantitative.
    *   Y-axis: Wind Speed (`measurement_value_wind:Q`) - Quantitative.
    *   Points: Represent daily average temperature and wind speed pairs for March (`mark_point`, dark green).
    *   Regression Line: Shows the linear trend (`mark_line`, red dashed).
    *   Text Annotations: Display the calculated Pearson correlation coefficient and linear regression equation.
    *   Tooltip: Shows 'Date', 'Avg Temp (°C)', 'Avg Wind (m/s)', and Location (Lat/Lon).
*   **Interaction:** Interactive zooming and panning is enabled on the plot area, allowing users to focus on specific clusters or ranges of data.
*   **Findings:** For March 2017, the relationship between daily average temperature and wind speed appears relatively weak. The scatter points show considerable variability, and the calculated linear correlation coefficient is low, suggesting no strong linear trend between these two variables on a daily average basis during this specific month.
*   **Assignment Task:** Part of fulfilling Task 3 (Visualizations). It's an interactive single view focused on variable relationships.

![image](https://github.com/user-attachments/assets/29cc8a0a-8d3b-40a7-aa3e-a3a5f44fe37e)
![Animation232332](https://github.com/user-attachments/assets/db1ab97d-80e1-468e-acdf-473352300bfe)

*(Screenshot and gif of the scatter plot showing the relationship between daily average temperature and wind speed in March 2017, including regression line and correlation.)*

---
### V7: Slider-Controlled Daily-Avg Facets

*   **Data Source:** `specs/faceted_slider.json` .
*   **Visual Mapping:**
    *   Cumulative Precipitation: Shown in inches 
    *   Relative Humidity: Percentage displayed 
    *   Soil Moisture: Percentage dsiplayed 
    *   Temperature: Temp shwon in celsius
    *   Windspeed: Windspeed shwon in m/s
*   **Interaction:** Scroll bar allows you to increase or decrease days viewed.
*   **Findings:** This plot showcases many small graphs that demonstrate ebbs and flows. Overall, the precipitation graph increases, soil moisture, and wind speed increase. On the other hand, the relatve humidity and temperature tend to decrease over time
*   **Assignment Task:** Task 4 (New multiple linked view)

![Animation121712](https://github.com/user-attachments/assets/ad6ec4ca-f50e-4172-90a2-2d623d8b8a75)

![image](https://github.com/user-attachments/assets/acaa685b-ddc8-4fc5-a021-735c7ffddef6)

---

### Task 6 (Extra Credit)

## The Visual Analytics Process Model

According to Keim et al., the visual analytics process can be formalized as a transformation F: S → I, where S represents the input data sets and I represents the insights gained. The process F is a concatenation of functions f ∈ {DW, VX, HY, UZ}, where:

- **DW**: Data preprocessing functions where W ∈ {T, C, SL, I}
  - DT: Data transformation
  - DC: Data cleaning
  - DSL: Data selection
  - DI: Data integration

- **VX**: Visualization functions where X ∈ {S, H}
  - VS: Functions visualizing data
  - VH: Functions visualizing hypotheses

- **HY**: Hypothesis generation functions where Y ∈ {S, V}
  - HS: Functions generating hypotheses from data
  - HV: Functions generating hypotheses from visualizations

- **UZ**: User interaction functions where Z ∈ {V, H, CV, CH}
  - UV: User interactions with visualizations
  - UH: User interactions with hypotheses
  - UCV: User interactions creating visualizations from which insights are derived
  - UCH: User interactions creating hypotheses from which insights are derived

## Formal Description of Chicago Environmental Sensors System

### Data Preprocessing Functions (DW)

- **DT (Data Transformation)**:
  - Conversion of essential columns to appropriate data types (datetime, numeric)
  - Correction of temperature values from specific sensor types (MK-III, Cumulus, TM1) using approximation formulas
  - Development of daily and hourly aggregations for time-based analysis
  - Spatial data integration with Chicago community areas using GeoPandas

- **DC (Data Cleaning)**:
  - Removal of duplicate records and rows with missing critical information
  - Elimination of outliers using IQR-based filtering and month-specific plausible ranges
  - Temperature sensor correction for sensors reporting raw voltage instead of Celsius

- **DSL (Data Selection)**:
  - Focus on data from January-June 2017 (winter through early summer transition)
  - Selection of five key measurement types: Temperature, RelativeHumidity, CumulativePrecipitation, SoilMoisture, WindSpeed
  - Filtering for relevant attributes: measurement_time, measurement_value, units, location data

- **DI (Data Integration)**:
  - Aggregation of hourly temperature means with standard deviations per month
  - Integration of daily precipitation totals with sensor resets handling
  - Spatial joining of temperature sensor data with neighborhood polygons
  - Calculation of lagged precipitation values for soil moisture response analysis

### Visualization Functions (VX)

- **VS (Data Visualization)**:
  - V1: Boxplots for monthly temperature distribution showing spread and central tendency
  - V2: Choropleth map for spatial temperature variation across Chicago neighborhoods
  - V3: Linked time series and scatter plot for temperature-humidity relationship
  - V4: Daily cycle plot with 24-hour temperature patterns across different months
  - V5: Focus+context time series for soil moisture response to precipitation
  - V6: Scatterplot with regression for temperature vs. wind speed correlation
  - V7: Faceted small multiples with slider control for multi-metric daily averages

- **VH (Hypothesis Visualization)**:
  - Correlation coefficient display in V6 to visualize temperature-wind relationship hypothesis
  - Lag correlation plot in V5 to visualize soil moisture response time hypothesis
  - Regression line in V6 representing linear relationship hypothesis

### Hypothesis Generation Functions (HY)

- **HS (Data-Based Hypotheses)**:
  - Correlation analysis between soil moisture and precipitation with various time lags
  - Linear regression between temperature and wind speed
  - Statistical analysis of neighborhood-specific temperature variations
  - Time-of-day temperature pattern analysis across months

- **HV (Visualization-Based Hypotheses)**:
  - Identification of inverse temperature-humidity relationship through V3 scatter exploration
  - Recognition of soil moisture response patterns following precipitation events in V5
  - Detection of warming trends and increasing variability through V1 boxplot analysis

### User Interaction Functions (UZ)

- **UV (Visualization Interaction)**:
  - V1: Hover over Boxplots to display information about that month
  - V2: Selection of neighborhoods in map to filter corresponding bar chart
  - V3: Brushing time intervals in time series to filter points in scatter plot
  - V4: Month selection in cycle view to filter trend data
  - V5: Brushing context view to focus soil moisture detail view
  - V6: Interactive zooming and panning for closer inspection of data points
  - V7: Slider control to adjust number of days viewed

- **UH (Hypothesis Interaction)**:
  - Examination of peak correlation in soil moisture lag plot
  - Assessment of temperature-wind speed correlation coefficient
  - Verification of temperature patterns through multiple linked views
  
- **UCV (Insight from Visualizations)**:
  - Insights about spatial temperature patterns from neighborhood map (V2)
  - Understanding of seasonal progression from temperature distribution (V1)
  - Recognition of daily cycles variation across months (V4)

- **UCH (Insight from Hypotheses)**:
  - Confirmation of soil moisture's delayed response to precipitation events
  - Understanding of weak correlation between temperature and wind speed
  - Insight into the inverse relationship between temperature and humidity
