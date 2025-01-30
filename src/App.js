import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Slider, Button, ButtonGroup, Typography } from "@mui/material";
import "./App.css";

const FIXED_SIZE = 400;

const PixelatedImage = () => {
  const [image, setImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [fillMode, setFillMode] = useState("random");
  const [speed, setSpeed] = useState(5);
  const [applyPixelation, setApplyPixelation] = useState(false);
  const containerRef = useRef(null);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const sortedPixels = useMemo(() => {
    const pixels = [];
    for (let y = 0; y < FIXED_SIZE; y += pixelSize) {
      for (let x = 0; x < FIXED_SIZE; x += pixelSize) {
        pixels.push({ x, y });
      }
    }
    switch (fillMode) {
      case "random":
        return pixels.sort(() => Math.random() - 0.5);
      case "right-to-left":
        return pixels.sort((a, b) => b.x - a.x);
      case "left-to-right":
        return pixels.sort((a, b) => a.x - b.x);
      case "diagonal":
        return pixels.sort((a, b) => a.x + a.y - (b.x + b.y));
      default:
        return pixels;
    }
  }, [pixelSize, fillMode]);

  useEffect(() => {
    if (!image || !applyPixelation || !containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.height = FIXED_SIZE;
      ctx.drawImage(img, 0, 0, FIXED_SIZE, FIXED_SIZE);
      const data = ctx.getImageData(0, 0, FIXED_SIZE, FIXED_SIZE).data;

      let index = 0;
      const render = () => {
        for (
          let i = 0;
          i < Math.min(speed, sortedPixels.length - index);
          i++, index++
        ) {
          const { x, y } = sortedPixels[index];
          const idx = (y * FIXED_SIZE + x) * 4;
          const color = `rgba(${data[idx]},${data[idx + 1]},${data[idx + 2]},${
            data[idx + 3] / 255
          })`;

          const pixelDiv = document.createElement("div");
          pixelDiv.style.setProperty("--pixel-color", color);
          pixelDiv.className = "block";
          Object.assign(pixelDiv.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
          });
          container.appendChild(pixelDiv);
        }
        if (index < sortedPixels.length) requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    };
  }, [image, pixelSize, fillMode, speed, applyPixelation, sortedPixels]);

  return (
    <div className="container">
      <div className="head">
        <Typography component="label" variant="h6">
          Upload Image:
          <input
            className="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Typography>
        <Button
          onClick={() => setApplyPixelation((prev) => !prev)}
          variant="contained"
          color="secondary"
        >
          {applyPixelation ? "Reset" : "Apply Pixelation"}
        </Button>
      </div>
      <Slider
        value={pixelSize}
        min={1}
        max={50}
        step={1}
        onChange={(_, v) => setPixelSize(v)}
      />
      <Slider
        value={speed}
        min={1}
        max={100}
        step={1}
        onChange={(_, v) => setSpeed(v)}
      />
      <ButtonGroup variant="contained" className="buttons">
        {["random", "right-to-left", "left-to-right", "diagonal"].map(
          (mode) => (
            <Button
              key={mode}
              onClick={() => setFillMode(mode)}
              disabled={fillMode === mode}
            >
              {mode.replace(/-/g, " ").toUpperCase()}
            </Button>
          )
        )}
      </ButtonGroup>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          margin: "auto",
          marginTop: "20px",
          width: FIXED_SIZE,
          height: FIXED_SIZE,
        }}
      ></div>
    </div>
  );
};

export default PixelatedImage;
