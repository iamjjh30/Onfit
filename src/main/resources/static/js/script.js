async function analyze() {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
    });

    const result = await response.text();
    document.getElementById("result").innerText = result;
}