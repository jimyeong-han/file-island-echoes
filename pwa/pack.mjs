export function musicFiles(audio){return [...new Set(Object.values(audio).filter(c=>c.kind==='music').flatMap(c=>c.files.map(f=>'assets/audio/'+f)))];}
