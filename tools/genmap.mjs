import {readFileSync, writeFileSync} from 'node:fs';
import * as topojson from 'topojson-client';
import {geoMercator, geoPath, geoCircle, geoDistance} from 'd3-geo';

const topo = JSON.parse(readFileSync('node_modules/us-atlas/states-10m.json','utf8'));
const fc = topojson.feature(topo, topo.objects.states);
const want = {'13':'GA','45':'SC','37':'NC'};
const ctx  = {'01':'AL','47':'TN','12':'FL'};
const pick = ids => ({type:'FeatureCollection', features: fc.features.filter(f=>ids[f.id])});
const core = pick(want), around = pick(ctx);

const BASE=[-83.8241,34.2979];
const W=1000,H=740;
const proj = geoMercator().fitExtent([[46,42],[W-46,H-42]], core);
const path = geoPath(proj);

const mi2rad = mi => (mi/3958.8)*(180/Math.PI);
const ring = mi => geoCircle().center(BASE).radius(mi2rad(mi)).precision(0.6)();

const cities=[
 ['Gainesville',-83.8241,34.2979,'base'],['Atlanta',-84.3880,33.7490,'metro'],
 ['Athens',-83.3576,33.9519,'metro'],['Greenville',-82.3940,34.8526,'metro'],
 ['Asheville',-82.5515,35.5951,'metro'],['Chattanooga',-85.3097,35.0456,'metro'],
 ['Augusta',-82.0105,33.4735,'metro'],['Macon',-83.6324,32.8407,'metro'],
 ['Columbia',-81.0348,34.0007,'edge'],['Charlotte',-80.8431,35.2271,'edge'],
 ['Rome',-85.1647,34.2570,'town'],['Dahlonega',-83.9849,34.5323,'town'],
 ['Clayton',-83.4013,34.8781,'town'],['Blue Ridge',-84.3241,34.8637,'town'],
 ['Toccoa',-83.3324,34.5773,'town'],['Helen',-83.7274,34.7015,'town'],
 ['Cumming',-84.1402,34.2073,'town'],['Canton',-84.4908,34.2368,'town'],
 ['Winder',-83.7202,33.9926,'town'],['Ellijay',-84.4821,34.6948,'town'],
 ['Anderson',-82.6501,34.5034,'town'],['Spartanburg',-81.9320,34.9496,'town'],
 ['Hendersonville',-82.4610,35.3187,'town'],['Commerce',-83.4571,34.2043,'town'],
 ['Buford',-84.0044,34.1207,'town'],['Marietta',-84.5499,33.9526,'town'],
];
const out={
  viewBox:`0 0 ${W} ${H}`,
  states: core.features.map(f=>({code:want[f.id], d:path(f)})),
  context: around.features.map(f=>({code:ctx[f.id], d:path(f)})),
  rings: [
    {minutes:45,  miles:42,  d:path(ring(42))},
    {minutes:90,  miles:84,  d:path(ring(84))},
    {minutes:150, miles:140, d:path(ring(140))},
  ],
  base: proj(BASE),
  cities: cities.map(([name,lon,lat,kind])=>{
    const p=proj([lon,lat]);
    const mi=geoDistance([lon,lat],BASE)*3958.8;
    return {name,kind,x:+p[0].toFixed(1),y:+p[1].toFixed(1),
            miles:Math.round(mi), minutes:Math.round(mi/56*60), inside: mi<=140};
  }),
};
writeFileSync('app/src/lib/data/coverage-geo.json', JSON.stringify(out));
console.log('states',out.states.length,'ctx',out.context.length,'rings',out.rings.length);
console.log('base',out.base.map(n=>n.toFixed(1)).join(','));
console.log(out.cities.filter(c=>c.inside).length,'of',out.cities.length,'inside 140mi');
console.log(out.cities.map(c=>`${c.name} ${c.miles}mi ${c.minutes}m ${c.inside?'IN':'out'}`).join(' | '));
