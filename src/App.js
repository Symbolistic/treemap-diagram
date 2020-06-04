import React, { useRef, useEffect } from 'react';
import './App.css';
import * as d3 from 'd3'
import legend from 'd3-svg-legend'

function App() {
  const svgRef = useRef();

  useEffect(() => {
    fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
      .then(response => response.json())
      .then(
        (result) => {
          renderD3(result, svgRef)
        }
      )
  })

  return (
    <div className="container">
      <h1 id="title">Video Game Sales</h1>
      <h2 id="description">Top 100 Most Sold Video Games Grouped by Platform</h2>
      <svg ref={svgRef}>
      </svg>
    </div>
  );
}

export default App;


const renderD3 = (data, svg) => {
  if (data.hasOwnProperty("name")) {
    // Height and Width for Canvas
    let height = 600;
    let width = 1200;


    // Color Scale
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // Creating the entire canvas
    let chart = d3.select(svg.current)
                  .attr("width", width)
                  .attr("height", height);

    let main = chart
                   .attr("width", width)
                   .attr("height", height)
                   .attr("class", "main");

    // Making the treemap               
    let treemapLayout = d3.treemap();

    treemapLayout
      .size([width, height])
      .paddingOuter(0)


    let root = d3.hierarchy(data)
                 .sum(d => d.hasOwnProperty("value") ? d.value : 0)
                 .sort((a, b) => b.height - a.height || b.value - a.value);
      
    treemapLayout(root);
      
    let div = d3.select(".container").append('div')
                        .attr("class", "tooltip")
                        .attr("id", "tooltip")
                        .style("opacity", 0);
      
    main
    .selectAll('rect')
    .data(root.leaves())
    .enter()
    .append('rect')
    .attr("class", "tile")
    .attr("data-name", value => value.data.name)
    .attr("data-category", value => value.data.category ? value.data.category : 0)
    .attr("data-value", value => value.data.value ? value.data.value : 0)
    .attr('x', function(d) { return d.x0; })
    .attr('y', function(d) { return d.y0; })
    .attr('width', function(d) { return d.x1 - d.x0; })
    .attr('height', function(d) { return d.y1 - d.y0; })
    .attr("fill", value => value.parent ? color(value.parent.children) : null )
    .attr("stroke", "white")
    .on("mouseover", value => {
      div.style("opacity", 0.9)
      div.html(value.data.name + "<br/>" + 
              "Category: " + value.data.category + "<br/>" +
              "Value: " + value.data.value) 
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 80) + "px");

      div.attr("data-value", value.data.value)
    })
    .on("mouseleave", () => { div.style("opacity", 0).style('top', 0)})


    var nodes = d3.select(svg.current)
    .selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'})
  
  nodes
    .append('rect')
    .attr('width', function(d) { return d.x1 - d.x0; })
    .attr('height', function(d) { return d.y1 - d.y0; })
    .attr("fill", "none")
  
  nodes
    .append('text')
    .attr('dx', 4)
    .attr('dy', 14)
    .attr("class", "game")
    .text(function(d) {
      if (d.depth >= 2) {
        return d.data.name;
      }
    });

  const colorConsoles = ["PC, XB, PSP", "Wii", "DS", "Xbox360", "GB, PS2 & PS4", "PS3", "SNES, NES, N64", "3DS", "Playstation", "GBA", "2600, XOne"]

  var legendContainer = d3.select(".container").append("svg")
    .attr("id", "legend")
    .attr("height", 300)
    .attr("width", 200)

  var legend = legendContainer.selectAll("#legend")
.data(color.domain())
.enter().append("g")
.attr("class", "legend-label")
.attr("transform", function(d, i) {
  return "translate(-40," + (240 - i * 20) + ")";
});

legend.append("rect")
.attr("x", 200 - 18)
.attr("width", 18)
.attr("height", 18)
.attr("class", "legend-item")
.style("fill", d => color(d));

legend.append("text")
.attr("x", 200 - 24)
.attr("y", 9)
.attr("dy", ".35em")
.style("text-anchor", "end")
.text((d, i) => colorConsoles[i])
  }
}