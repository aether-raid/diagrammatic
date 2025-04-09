jest.setTimeout(10000);

// Create a properly typed mock for global.fetch
global.fetch = jest.fn().mockImplementation((input, init) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: typeof input === "string" ? input : input.url,
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(""),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        clone: function () {
            return this;
        },
    });
});

// // Mock any browser-specific APIs that might be used in your code
// global.URL.createObjectURL = jest.fn();
// global.Blob = function Blob(content, options) {
//   return { content, options };
// };

// // Mock VSCode API if needed
// global.vscode = {
//   window: {
//     showInformationMessage: jest.fn(),
//     showErrorMessage: jest.fn(),
//   },
//   workspace: {
//     getConfiguration: jest.fn(() => ({
//       get: jest.fn(),
//       update: jest.fn(),
//     })),
//   },
// };

// Clean up after all tests
afterAll(() => {
    jest.restoreAllMocks();
});
