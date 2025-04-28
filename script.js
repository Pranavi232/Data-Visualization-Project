let allData = [];
let allYears = [];
let currentYearIndex = 0;
let isPlaying = true;
let autoLoopInterval;
let currentLimit = 10;
let worldMap;
const filePath = "mental health.csv";

const svgScatter = d3.select("#scatterPlot svg").select("g");
const svgBar = d3.select("#barChart svg").select("g");
const svgMap = d3.select("#map svg").select("g");

const margin = {top: 20, right: 20, bottom: 80, left: 70};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const tooltip = d3.select("#tooltip");

function updateYearLabel(year) {
  d3.select("#yearSelector").property("value", year);
}

function nextStep() {
  if (!isPlaying) return;
  const year = allYears[currentYearIndex % allYears.length];
  drawBarChart(allData, year, currentLimit);
  drawScatterPlot(allData, year);
  drawMap(worldMap, year);
  updateYearLabel(year);
  currentYearIndex++;
}

function runAutoLoop() {
  autoLoopInterval = setInterval(nextStep, 4000);
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  d3.select("#playPauseBtn").text(isPlaying ? "Pause" : "Play");
  if (isPlaying) runAutoLoop();
  else clearInterval(autoLoopInterval);
}

d3.csv(filePath, d => ({
  Country: d.Entity,
  Depression: +d.DepressiveDisorders,
  Anxiety: +d.AnxietyDisorders,
  Stress: +d.TotalPercentageOfPopulation,
  Code: d.Code,
  Year: +d.Year
})).then(data => {
  allData = data;
  allYears = [...new Set(allData.map(d => d.Year))].sort((a, b) => a - b);

  const yearSelector = d3.select("#yearSelector");
  yearSelector.selectAll("option")
    .data(allYears)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  yearSelector.on("change", function() {
    currentYearIndex = allYears.indexOf(+this.value);
    nextStep();
  });

  d3.select("#countryLimit").on("change", function() {
    currentLimit = this.value;
    nextStep();
  });

  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(world => {
      worldMap = world;
      drawBarChart(allData, allYears[0], currentLimit);
      drawScatterPlot(allData, allYears[0]);
      drawMap(worldMap, allYears[0]);
      updateYearLabel(allYears[0]);
      runAutoLoop();
    });

  d3.select("#playPauseBtn").on("click", togglePlayPause);
});

// SCATTER PLOT
function drawScatterPlot(data, year) {
  svgScatter.selectAll("*").remove();

  const plotWidth = +d3.select("#scatterPlot svg").attr("width") - margin.left - margin.right - 250;

  // Filter for selected year
  const filtered = data.filter(d => d.Year === +year)
    .sort((a, b) => d3.descending(a.Stress, b.Stress));

  // Apply Top N limit for scatter plot too
  const limitedData = (currentLimit === "All") ? filtered : filtered.slice(0, +currentLimit);

  // X and Y Scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(limitedData, d => d.Depression) * 1.1])
    .range([0, plotWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(limitedData, d => d.Anxiety) * 1.1])
    .range([height, 0]);

    const size = d3.scaleSqrt()
    .domain([
      d3.min(limitedData, d => d.Stress),
      d3.max(limitedData, d => d.Stress)
    ])
    .range([4, 15]);  
  

  const uniqueEntities = Array.from(new Set(limitedData.map(d => d.Country))).sort(d3.ascending);

  const colorPalette = [].concat(
    d3.schemeSet3, d3.schemeSet2, d3.schemeSet1,
    d3.schemePastel1, d3.schemePastel2, d3.schemeDark2, d3.schemeAccent
  );

  const color = d3.scaleOrdinal()
    .domain(uniqueEntities)
    .range(colorPalette);

  // Axes
  svgScatter.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svgScatter.append("g")
    .call(d3.axisLeft(y));

  // Scatter Dots
  const dots = svgScatter.selectAll(".dot")
    .data(limitedData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.Depression))
    .attr("cy", d => y(d.Anxiety))
    .attr("r", d => size(d.Stress))   
    .style("fill", d => color(d.Country))
    .style("stroke", "black")
    .style("opacity", 0.7)
    .attr("data-entity", d => d.Country)
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`Country: ${d.Country}<br>Depression: ${d.Depression}%<br>Anxiety: ${d.Anxiety}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");

      dots.transition()
        .duration(200)
        .style("opacity", o => (o.Country === d.Country ? 1 : 0.1));

      d3.selectAll(".legend-entry")
        .transition()
        .duration(200)
        .style("opacity", o => (o === d.Country ? 1 : 0.2))
        .style("font-weight", o => (o === d.Country ? "bold" : "normal"))
        .style("background-color", o => (o === d.Country ? "#f0f0f0" : "white"));
    })
    .on("mouseout", function() {
      tooltip.transition().duration(500).style("opacity", 0);
      dots.transition().duration(500).style("opacity", 0.7);
      d3.selectAll(".legend-entry")
        .transition()
        .duration(500)
        .style("opacity", 1)
        .style("font-weight", "normal")
        .style("background-color", "white");
    });

  const legendContainer = d3.select("#scatterPlot svg")
    .append("foreignObject")
    .attr("x", plotWidth + 80)
    .attr("y", 100)
    .attr("width", 180)
    .attr("height", 300)
    .append("xhtml:div")
    .style("width", "160px")
    .style("height", "280px")
    .style("overflow-y", "auto")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("background", "white")
    .style("font-size", "12px");

  legendContainer.append("div")
    .style("font-weight", "bold")
    .style("margin-bottom", "5px")
    .text("Countries:");

  const legendItems = legendContainer.selectAll(".legend-entry")
    .data(uniqueEntities)
    .enter()
    .append("div")
    .attr("class", "legend-entry")
    .text(d => d)
    .style("margin-bottom", "5px")
    .style("display", "flex")
    .style("align-items", "center")
    .style("cursor", "pointer")
    .on("mouseover", function(event, countryName) {
        d3.select(this)
          .style("background-color", "#e0e0e0")
          .style("font-weight", "bold");
      
        dots.transition()
          .duration(200)
          .style("opacity", o => (o.Country === countryName ? 1 : 0.1));
      
        const matchedDot = dots.filter(d => d.Country === countryName);
        const matchedData = dots.data().find(d => d.Country === countryName);
      
        if (!matchedDot.empty() && matchedData) {
          const cx = +matchedDot.attr("cx");
          const cy = +matchedDot.attr("cy");
      
          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
      
          tooltip.html(`Country: ${matchedData.Country}<br>Depression: ${matchedData.Depression}%<br>Anxiety: ${matchedData.Anxiety}%`)
            .style("left", (margin.left + cx + 100) + "px")   // Shift based on SVG
            .style("top", (margin.top + cy + 100) + "px");    // Below the bubble
        }
      })
      .on("mouseover", function(event, countryName) {
        d3.select(this)
          .style("background-color", "#e0e0e0")
          .style("font-weight", "bold");
      
        dots.transition()
          .duration(200)
          .style("opacity", o => (o.Country === countryName ? 1 : 0.1));
      
        const matchedDot = dots.filter(d => d.Country === countryName);
        const matchedData = dots.data().find(d => d.Country === countryName);
      
        if (!matchedDot.empty() && matchedData) {
          const cx = +matchedDot.attr("cx");
          const cy = +matchedDot.attr("cy");
      
          const svg = d3.select("#scatterPlot svg").node();
          const point = svg.createSVGPoint();
          point.x = cx + margin.left;
          point.y = cy + margin.top;
          const screenCTM = svg.getScreenCTM();
          const transformed = point.matrixTransform(screenCTM);
      
          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
      
          tooltip.html(`Country: ${matchedData.Country}<br>Depression: ${matchedData.Depression}%<br>Anxiety: ${matchedData.Anxiety}%`)
            .style("left", (transformed.x + 10) + "px")
            .style("top", (transformed.y - 10) + "px");
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("background-color", "white")
          .style("font-weight", "normal");
      
        dots.transition()
          .duration(500)
          .style("opacity", 0.7);
      
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
      
  legendItems.insert("div", ":first-child")
    .style("width", "12px")
    .style("height", "12px")
    .style("background-color", d => color(d))
    .style("margin-right", "5px");
}
// GROUPED BAR CHART
function drawBarChart(data, year, limit) {
    svgBar.selectAll("*").remove();
  
    const filtered = data.filter(d => d.Year === +year)
      .sort((a, b) => b.Stress - a.Stress);
  
    const topFiltered = limit === "All" ? filtered : filtered.slice(0, +limit);
  
    const subgroups = ["Depression", "Anxiety", "Stress"];
    const groups = topFiltered.map(d => d.Country);
  
    const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2]);
  
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding([0.05]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(topFiltered, d => Math.max(d.Depression, d.Anxiety, d.Stress)) * 1.2])
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["#6a3d9a", "#1f78b4", "#33a02c"]);
  
    // Shift bar chart slightly down
    const chartGroup = svgBar.append("g")
      .attr("transform", "translate(0,30)");
  
    chartGroup.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  
    chartGroup.append("g")
      .call(d3.axisLeft(y));
  
    chartGroup.append("g")
      .selectAll("g")
      .data(topFiltered)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d.Country)},0)`)
      .selectAll("rect")
      .data(d => subgroups.map(key => ({key: key, value: d[key]})))
      .enter()
      .append("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`${d.key}: ${d.value.toFixed(2)}%`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  
    // Bar Chart Legend (moved right)
    const barLegend = svgBar.append("g")
      .attr("transform", `translate(${width + 20}, 100)`);
  
    const keys = ["Depression", "Anxiety", "Stress"];
  
    barLegend.selectAll("legendDots")
      .data(keys)
      .enter()
      .append("circle")
        .attr("cx", 10)
        .attr("cy", (d,i) => i * 25)
        .attr("r", 6)
        .style("fill", d => color(d));
  
    barLegend.selectAll("legendLabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 25)
        .attr("y", (d,i) => i * 25)
        .text(d => d)
        .attr("alignment-baseline", "middle");
  }
  
  // CHOROPLETH MAP
  function drawMap(world, year) {
    svgMap.selectAll("*").remove();
  
    const yearData = allData.filter(d => d.Year === +year);
  
    const stressByCode = {};
    yearData.forEach(d => {
      stressByCode[d.Code] = d.Stress;
    });
  
    const sortedCountries = [...yearData].sort((a, b) => b.Stress - a.Stress);
    const ranks = {};
    sortedCountries.forEach((d, i) => {
      ranks[d.Code] = i + 1;
    });
  
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(yearData, d => d.Stress)])
      .interpolator(d3.interpolateOranges);
  
    const projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([430, 250]);
  
    const path = d3.geoPath().projection(projection);
  
    svgMap.selectAll("path")
      .data(world.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const val = stressByCode[d.id];
        return val ? colorScale(val) : "#ccc";
      })
      .style("stroke", "black")
      .on("mouseover", function(event, d) {
        const countryName = d.properties.name;
        const val = stressByCode[d.id];
        const rank = ranks[d.id];
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
          `${countryName}<br>Stress: ${val ? val.toFixed(2) : "N/A"}%<br>Rank: ${rank ? rank : "N/A"}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  
    // Color Scale Legend for Choropleth
    const defs = svgMap.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
  
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.interpolateOranges(0));
  
    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.interpolateOranges(1));
  
    svgMap.append("rect")
      .attr("x", 850)
      .attr("y", 150)
      .attr("width", 15)
      .attr("height", 200)
      .style("fill", "url(#linear-gradient)");
  
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.Stress)])
      .range([350, 150]);
  
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5);
  
    svgMap.append("g")
      .attr("transform", "translate(865,0)")
      .call(legendAxis);
  }
  