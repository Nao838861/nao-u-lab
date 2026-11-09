// Instantiate the exact bytes that the caller already fetched and verified.
// Emscripten's generated factory does not consume its wasmBinary option here.
export async function loadCore(createCore,bytes){
  const compiled=await WebAssembly.compile(bytes);
  return createCore({instantiateWasm(imports,receive){
    const instance=new WebAssembly.Instance(compiled,imports);receive(instance);return instance.exports;
  }});
}
