## Impact of Urbanization on Mental Health in Major Countries
## Group Members
- Pranavi Nadipalli
- Klodiana Gjermizi
- Athulya Prasad

## Project Description
This project provides an interactive web-based visualization of mental health statistics across different countries and years. The visualizations include:

- Scatter Plot: Depressive Disorders (%) vs Anxiety Disorders (%) by Country
- Grouped Bar Chart: Depressive Disorders, Anxiety Disorders, and Stress levels across top countries
- Choropleth Map: Global distribution of Stress (% of population)

The project uses D3.js to create fully interactive visualizations, allowing users to:
- Select the year
- Change the number of countries displayed (Top 10, 20, 30, or All)
- This Automatic Transition helps us see the Barchart and scatterplot data for all the years for top 10, top 20 and top 30 countries.
- The Visualization changes every 10 secs starting from the 1990 and will end at 2017 for top 120 countries and continue again after the year 2017.
- Play/Pause automatic year transition, which enables us to pause the transition and access it manually too.
---

## How to Run the Project
1. Download or clone the project folder.
2. Ensure the following files are in the same directory:
   - 'index.html'
   - 'script.js'
   - 'mental health.csv'
3. Open 'index.html' and 'script.js' in VS code
4. Right click on the 'index.html' and Open it with Live Server.

**No backend server or Node.js installation is needed.**

## Understanding the Visualizations
### Scatter Plot
- X-Axis: Percentage of Depressive Disorders in the population.
- Y-Axis: Percentage of Anxiety Disorders in the population.
- Point Size: Reflects the Percentage variation between both the Depression and Anxiety disorders in the country.
- Point Color: Represents different countries.
- Interactive Elements: Tooltip showing country name, depression %, anxiety %; and a clickable legend.

### Grouped Bar Chart
- X-Axis: Country names.
- Y-Axis: Percentage of population.
  - Purple: Depressive Disorders
  - Blue: Anxiety Disorders
  - Green: Stress Percentage
- Interactive Elements: Tooltip shows precise value on hover.

### Choropleth Map
- Color Intensity: Represents Stress percentage (darker = higher stress).
- Interactive Elements: Tooltip showing country name, Stress % value, and its global rank.

---

## Visualizations Used (and Explained)
- Scatter Plot: Shows the relationship between two quantitative variables (Depression and Anxiety rates).
- Bar Chart: Compares multiple categories (Depression, Anxiety, Stress) across countries.
- Choropleth Map: Encodes quantitative data (Stress) geographically across countries.
- Play/Pause Animation: Animates changes in mental health statistics over time (years).
- Tooltip + Legend Interactivity: Enhances readability and provides immediate data context.

---
## Code Explanation

The codebase is primarily written in JavaScript using the D3.js library for data-driven visualizations. It consists of two main files:

- index.html: Sets up the web page structure.
    - Includes buttons to switch between Scatter Plot, Bar Chart, and Choropleth Map.
    - Contains dropdowns for year and top country selection.
    - Defines SVG containers for each visualization.
    - Tooltip container for displaying dynamic information on hover.

- script.js:
    - Data Loading: Loads mental health statistics from mental health.csv.
    - Scatter Plot:
        - X-Axis: Depressive Disorders (%)
        - Y-Axis: Anxiety Disorders (%)
        - Interactive tooltips and clickable legends.
    - Grouped Bar Chart:
        - Displays Depression, Anxiety, and Stress percentages for top countries.
        - Each bar is color-coded.
        - Includes hover-based tooltips.
    - Choropleth Map:
        - Colors the world map based on Stress percentages.
        - Includes color scale legend.
        - Tooltip on hover shows Stress % and global ranking.
    - Animation:
        - Play/Pause functionality to animate transitions across years.
    - Interactivity:
        - User can filter top countries or select a specific year.
    - Libraries Used:
        - D3.js v7 for dynamic visualizations.
        - GeoJSON data for world map rendering.
All visualizations are interactive, responsive, and animated to enhance storytelling and data understanding.