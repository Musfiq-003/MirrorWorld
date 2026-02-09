import { Client } from "@gradio/client";

async function testHunyuan() {
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || process.env.VITE_HUGGINGFACE_TOKEN;
    if (!hfToken) {
        throw new Error("Missing Hugging Face token. Set HF_TOKEN (or HUGGINGFACE_TOKEN) in your environment.");
    }

    const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    const exampleImage = await response_0.blob();

    const client = await Client.connect("tencent/Hunyuan3D-2", {
        token: hfToken
    });

    const result = await client.predict("/generation_all", {
        caption: "Hello!!",
        image: exampleImage,
        mv_image_front: exampleImage,
        mv_image_back: exampleImage,
        mv_image_left: exampleImage,
        mv_image_right: exampleImage,
        steps: 1,
        guidance_scale: 3,
        seed: 0,
        octree_resolution: 16,
        check_box_rembg: true,
        num_chunks: 1000,
        randomize_seed: true,
    });

    console.log(result.data);
}

testHunyuan();
