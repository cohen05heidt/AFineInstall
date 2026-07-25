import {readFileSync, writeFileSync} from 'node:fs';
import * as topojson from 'topojson-client';
import {geoMercator, geoPath, geoCircle, geoDistance} from 'd3-geo';

/* Shop position and the drive assumption. 1.5 hours at 56 mph of mixed
   interstate and two lane north Georgia road is 84 miles. */
const BASE=[-83.8241,34.2979];
const MPH=56;
const RINGS=[30,60,90];            // minutes
const OUTER=Math.round(90/60*MPH); // 84 miles

const topo = JSON.parse(readFileSync('node_modules/us-atlas/states-10m.json','utf8'));
const fc = topojson.feature(topo, topo.objects.states);
const want = {'13':'GA','45':'SC','37':'NC'};
const ctx  = {'01':'AL','47':'TN','12':'FL'};
const pick = ids => ({type:'FeatureCollection', features: fc.features.filter(f=>ids[f.id])});
const core = pick(want), around = pick(ctx);

const W=1000,H=740;
const proj = geoMercator().fitExtent([[46,42],[W-46,H-42]], core);
const path = geoPath(proj);
const mi2rad = mi => (mi/3958.8)*(180/Math.PI);
const ring = mi => geoCircle().center(BASE).radius(mi2rad(mi)).precision(0.6)();

/* kinds: base | metro (dot + name + drive time) | town (dot + name)
   | minor (dot only, no label: too close to the shop to be worth the ink) */
const cities=[
 ['Gainesville',-83.8241,34.2979,'base'],
 ['Atlanta',-84.3880,33.7490,'metro'],   ['Athens',-83.3576,33.9519,'metro'],
 ['Anderson',-82.6501,34.5034,'metro'],  ['Greenville',-82.3940,34.8526,'metro'],
 ['Asheville',-82.5515,35.5951,'metro'], ['Chattanooga',-85.3097,35.0456,'metro'],
 ['Augusta',-82.0105,33.4735,'metro'],   ['Macon',-83.6324,32.8407,'metro'],
 ['Spartanburg',-81.9320,34.9496,'metro'],
 ['Columbia',-81.0348,34.0007,'metro'],  ['Charlotte',-80.8431,35.2271,'metro'],
 ['Dahlonega',-83.9849,34.5323,'town'],  ['Cumming',-84.1402,34.2073,'minor'],
 ['Buford',-84.0044,34.1207,'minor'],     ['Winder',-83.7202,33.9926,'minor'],
 ['Commerce',-83.4571,34.2043,'minor'],   ['Toccoa',-83.3324,34.5773,'town'],
 ['Helen',-83.7274,34.7015,'town'],      ['Cleveland',-83.7624,34.5968,'minor'],
 ['Clarkesville',-83.5254,34.6132,'minor'],['Dawsonville',-84.1191,34.4215,'minor'],
 ['Canton',-84.4908,34.2368,'town'],     ['Clayton',-83.4013,34.8781,'town'],
 ['Hiawassee',-83.7574,34.9490,'town'],  ['Blue Ridge',-84.3241,34.8637,'town'],
 ['Ellijay',-84.4821,34.6948,'town'],    ['Jasper',-84.4291,34.4681,'minor'],
 ['Rome',-85.1647,34.2570,'town'],       ['Marietta',-84.5499,33.9526,'town'],
 ['Alpharetta',-84.2941,34.0754,'minor'], ['Lawrenceville',-83.9880,33.9562,'minor'],
 ['Westminster',-83.0932,34.6640,'minor'],['Walhalla',-83.0640,34.7654,'town'],
 ['Seneca',-82.9534,34.6887,'town'],     ['Clemson',-82.8374,34.6834,'town'],
 ['Franklin',-83.3813,35.1821,'town'],   ['Highlands',-83.1968,35.0526,'town'],
 ['Murphy',-84.0345,35.0873,'town'],     ['Hayesville',-83.8177,35.0437,'town'],
];
const out={
  viewBox:`0 0 ${W} ${H}`,
  driveMinutes: 90, driveMiles: OUTER, mph: MPH,
  states: core.features.map(f=>({code:want[f.id], d:path(f)})),
  context: around.features.map(f=>({code:ctx[f.id], d:path(f)})),
  rings: RINGS.map(min=>{
    const miles=Math.round(min/60*MPH);
    return {minutes:min, miles, d:path(ring(miles))};
  }),
  base: proj(BASE),
  cities: cities.map(([name,lon,lat,kind])=>{
    const p=proj([lon,lat]);
    const mi=geoDistance([lon,lat],BASE)*3958.8;
    return {name,kind,x:+p[0].toFixed(1),y:+p[1].toFixed(1),
            miles:Math.round(mi), minutes:Math.round(mi/MPH*60), inside: mi<=OUTER};
  }),
};
writeFileSync('app/src/lib/data/coverage-geo.json', JSON.stringify(out));
const ins=out.cities.filter(c=>c.inside), o=out.cities.filter(c=>!c.inside);
console.log('outer radius:',OUTER,'mi  rings:',out.rings.map(r=>r.minutes+'min/'+r.miles+'mi').join(' '));
console.log('\nINSIDE ('+ins.length+'):'); console.log(ins.map(c=>`${c.name} ${c.miles}mi/${c.minutes}m`).join(' | '));
console.log('\nOUTSIDE ('+o.length+'):'); console.log(o.map(c=>`${c.name} ${c.miles}mi/${c.minutes}m`).join(' | '));
const st=n=>ins.filter(c=>n.includes(c.name)).length;
console.log('\nSC towns inside:', ins.filter(c=>['Westminster','Walhalla','Seneca','Clemson','Anderson','Greenville','Spartanburg'].includes(c.name)).map(c=>c.name).join(', ')||'NONE');
console.log('NC towns inside:', ins.filter(c=>['Franklin','Highlands','Murphy','Hayesville','Asheville','Hendersonville','Charlotte'].includes(c.name)).map(c=>c.name).join(', ')||'NONE');
