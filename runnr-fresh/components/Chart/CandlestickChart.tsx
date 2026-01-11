import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

const CandlestickChart = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0f" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#1f2933" },
        horzLines: { color: "#1f2933" },
      },
      timeScale: {
        borderColor: "#1f2933",
      },
      rightPriceScale: {
        borderColor: "#1f2933",
      },
      crosshair: {
        mode: 1,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData([
      { time: "2025-01-01", open: 100, high: 110, low: 95, close: 105 },
      { time: "2025-01-02", open: 105, high: 112, low: 101, close: 108 },
      { time: "2025-01-03", open: 108, high: 115, low: 104, close: 111 },
      { time: "2025-01-04", open: 111, high: 113, low: 107, close: 109 },
      { time: "2025-01-05", open: 109, high: 118, low: 108, close: 116 },
    ]);

    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({
        width: containerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-[500px]" />;
};

export default CandlestickChart;
