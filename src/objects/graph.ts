import { createCanvas } from "canvas";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function makeGraph(
  label: string[],
  dataArray: number[]
): Buffer {
  const data = {
    labels: label,
    datasets: [
      {
        label: "Nombre de Votes",
        data: dataArray,
        backgroundColor: ["red", "blue", "green", "yellow", "purple"],
        borderColor: ["red", "blue", "green", "yellow", "purple"],
        borderWidth: 1,
      },
    ],
  };
  const canvas = createCanvas(800, 600);
  const context = canvas.getContext(
    "2d"
  ) as unknown as CanvasRenderingContext2D;
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const chart = new Chart(context, {
    type: "doughnut",
    data,
    options: {
      plugins: {
        legend: {
          labels: {
            boxWidth: 60,
            font: {
              size: 30,
            },
            color: "#98fb98",
          },
        },
      },
    },
  });

  console.log(chart);
  return canvas.toBuffer("image/png");
}
