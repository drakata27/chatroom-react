function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

function getAggressiveGradient() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  const color3 = getRandomColor();
  const angle = Math.floor(Math.random() * 360); // Random angle for the gradient
  return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.setProperty(
    "--background-color",
    getAggressiveGradient()
  );
});
