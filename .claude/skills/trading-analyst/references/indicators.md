# Technical Indicators — Reference Guide

## Momentum Indicators

### RSI (Relative Strength Index)
- **Parameters**: 14 periods (standard), 9 (aggressive), 21 (conservative)
- **Overbought**: >70 (strong trend), >80 (extreme)
- **Oversold**: <30 (strong trend), <20 (extreme)
- **Divergence types**:
  - Bullish: price lower low, RSI higher low → reversal signal
  - Bearish: price higher high, RSI lower high → reversal signal
  - Hidden bullish: price higher low, RSI lower low → continuation
  - Hidden bearish: price lower high, RSI higher high → continuation
- **In trends**: RSI 40–80 range (uptrend), 20–60 range (downtrend)

### MACD (Moving Average Convergence/Divergence)
- **Parameters**: 12/26/9 (standard), 5/13/1 (crypto short-term)
- **Signal line crossover**: bullish above / bearish below signal
- **Zero line cross**: bullish above / bearish below zero
- **Histogram**: momentum acceleration/deceleration
- **Divergence**: same rules as RSI; very reliable on daily/weekly

### Stochastic Oscillator
- **Parameters**: 14,3,3 (standard) / 5,3,3 (fast)
- **Overbought**: >80 / **Oversold**: <20
- **Best in**: ranging/choppy markets
- **K cross D**: signal line cross for entries
- **Weekly stochastic**: powerful for swing trade timing

## Trend Indicators

### Moving Averages
| MA | Use Case |
|-----|----------|
| 9 EMA | Very short-term momentum (crypto/scalping) |
| 20 EMA | Short-term trend, pullback entries |
| 50 SMA/EMA | Medium-term trend, key institutional level |
| 100 SMA | Medium-long term support/resistance |
| 200 SMA | Primary long-term trend (the "line in the sand") |

- **Golden Cross**: 50 MA crosses above 200 MA → bullish
- **Death Cross**: 50 MA crosses below 200 MA → bearish
- **MA Spacing**: compressed = low momentum, expanded = strong trend

### Bollinger Bands
- **Parameters**: 20 SMA, ±2 standard deviations
- **Squeeze**: bands narrow → volatility compression → breakout pending
- **Walk**: price "walks" the upper/lower band = strong trend
- **Mean reversion**: after expansion, price returns to midline
- **%B**: (Price − Lower) / (Upper − Lower). >1 = above upper band, <0 = below lower

### Ichimoku Cloud
- **Tenkan (9)** / **Kijun (26)**: fast/slow signal lines
- **Cloud (Kumo)**: resistance above price, support below price
- **Chikou**: lagging span confirmation
- **Simple rule**: price above cloud + tenkan > kijun = bullish

## Volume Indicators

### Volume Profile
- **POC (Point of Control)**: price level with most volume traded — magnetic
- **VAH/VAL**: Value Area High/Low (70% of volume)
- **HVN (High Volume Node)**: strong support/resistance
- **LVN (Low Volume Node)**: thin volume = price moves fast through it

### VWAP (Volume-Weighted Average Price)
- Institutional benchmark — market makers use it
- **Above VWAP**: bullish intraday bias
- **Below VWAP**: bearish intraday bias
- **Anchored VWAP**: anchor to key dates (earnings, gap, event)

### OBV (On-Balance Volume)
- Rising OBV + rising price = confirmed uptrend
- Rising OBV + falling price = bullish divergence (accumulation)
- Falling OBV + rising price = bearish divergence (distribution)

## Volatility Indicators

### ATR (Average True Range)
- **Parameters**: 14 periods
- **Use**: stop loss placement (1.5–2.5× ATR)
- **Increasing ATR**: volatility expanding (trends, breakouts)
- **Decreasing ATR**: volatility compressing (consolidation pending)

### VIX (CBOE Volatility Index)
- **< 15**: complacency / risk-on
- **15–25**: normal uncertainty
- **25–35**: elevated fear
- **> 35**: extreme fear / capitulation zone
- **VIX spike + market sell-off**: often a short-term bottom signal
- **VIX divergence**: market rises while VIX doesn't fall = warning sign

## Advanced / Institutional

### Fibonacci Retracement Levels
- 23.6% — shallow retracement (strong trend)
- 38.2% — first major support in strong trend
- 50.0% — psychological midpoint
- 61.8% — "golden ratio," most watched level
- 78.6% — deep retracement, last hold before full reversal

### Options Metrics (Equities)
- **Gamma**: rate of change of delta — high gamma near expiry = volatile
- **Max Pain**: strike where options sellers have least loss — price gravitates
- **IV Rank/IV Percentile**: compare current IV to historical range
  - High IVR (>50): sell options premium
  - Low IVR (<20): buy options premium
- **Put/Call Ratio**:
  - > 1.0: bearish positioning
  - < 0.7: complacency / bullish positioning
  - Extreme readings = contrarian signal
