// Rendering is provenance only. It never selects physics, rules or the state decoder.
export const REPLAY_VARIANTS=Object.freeze(['2d','3d','raster-scroll']);
// Ranking badges show the recording source; playback presentation is independent.
export const REPLAY_VARIANT_ICONS=Object.freeze(Object.fromEntries(REPLAY_VARIANTS.map(variant=>[variant,`replay-variant-icons.svg#${variant}`])));
export function replayProducer(value){
  if(!value||typeof value.app!=='string'||typeof value.version!=='string')return null;
  const producer={app:value.app.slice(0,64),version:value.version.slice(0,64)};
  // Keep future identifiers without making older readers reject the recording.
  if(typeof value.variant==='string'&&/^[a-z0-9][a-z0-9-]{0,31}$/.test(value.variant))producer.variant=value.variant;
  return producer;
}
export function replayVariant(replay){return replay.producer?.variant||'2d';}
