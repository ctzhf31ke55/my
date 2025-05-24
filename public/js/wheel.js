import { findMostValuableAsset } from './app.js';
import * as d3 from 'd3';

console.log('d3:', d3);

var w = 350,
    h = 350,
    r = w / 2,
    rotation = 0,
    oldrotation = 0,
    spun = false;

var data = Array.from({ length: 10 }, (_, i) => ({ label: `Option ${i + 1}` }));

var svg = d3.select('#chart').append("svg")
  .attr("width", w)
  .attr("height", h);

var container = svg.append("g")
  .attr("transform", `translate(${w / 2},${h / 2})`);

var vis = container.append("g");

var pie = d3.pie().sort(null).value(() => 1);

var arc = d3.arc().outerRadius(r - 10).innerRadius(0);

var arcs = vis.selectAll("g.slice")
  .data(pie(data))
  .enter().append("g")
  .attr("class", "slice");

arcs.append("path")
  .attr("fill", "#3498db")
  .attr("d", arc);

arcs.append("text")
  .attr("transform", d => {
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return `rotate(${d.angle * 180 / Math.PI - 90})translate(${d.outerRadius - 20})`;
  })
  .attr("text-anchor", "end")
  .text((_, i) => data[i].label)
  .style("font-size", "14px")
  .style("pointer-events", "none");

var spinButton = container.append("g")
  .attr("class", "spin-button")
  .style("cursor", "pointer");

spinButton.append("circle")
  .attr("r", 50);

spinButton.append("text")
  .attr("y", 10)
  .attr("text-anchor", "middle")
  .text("SPIN")
  .style("font-weight", "bold")
  .style("font-size", "22px")
  .style("pointer-events", "none");

spinButton.on("click", spin);

function spin() {
  if (spun) return;
  spun = true;
  findMostValuableAsset();
  var ps = 360 / data.length, rng = Math.floor((Math.random() * 1440) + 360);
  rotation = Math.round(rng / ps) * ps + 90 - Math.round(ps / 2);
  vis.transition().duration(4000).attrTween("transform", () => {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return t => `rotate(${i(t)})`;
  }).on("end", () => {
    oldrotation = rotation;
    spun = false;
    document.getElementById('confirmButton').style.display = 'block';
  });
}

export function showWheel() {
  document.getElementById('donateSection').style.display = 'block';
}
