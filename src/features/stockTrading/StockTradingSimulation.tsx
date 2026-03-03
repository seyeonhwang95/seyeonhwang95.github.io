import { useEffect, useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const TOP_SP_STOCKS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'AMZN',
  'GOOGL',
  'META',
  'BRK.B',
  'LLY',
  'AVGO',
  'JPM',
] as const

type StockSymbol = (typeof TOP_SP_STOCKS)[number]

type Holdings = Record<StockSymbol, { shares: number; avgCost: number }>
type PriceMap = Record<StockSymbol, number>

type TimePoint = {
  time: string
  price: number
}

type PortfolioPoint = {
  tick: string
  balance: number
  earnings: number
}

const BASE_PRICES: PriceMap = {
  AAPL: 185,
  MSFT: 415,
  NVDA: 890,
  AMZN: 175,
  GOOGL: 165,
  META: 500,
  'BRK.B': 415,
  LLY: 780,
  AVGO: 1250,
  JPM: 190,
}

const portfolioChartConfig: ChartConfig = {
  balance: { label: 'Total Balance', color: 'var(--color-chart-1)' },
  earnings: { label: 'Total Earnings', color: 'var(--color-chart-2)' },
}

const priceChartConfig: ChartConfig = {
  price: { label: 'Price', color: 'var(--color-chart-1)' },
}

function randomWalk(value: number) {
  const drift = (Math.random() - 0.5) * 0.016
  return Math.max(1, value * (1 + drift))
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function generateHistoricalDay(basePrice: number) {
  const points: TimePoint[] = []
  const start = new Date()
  start.setHours(9, 30, 0, 0)

  let price = basePrice
  for (let index = 0; index < 78; index += 1) {
    price = randomWalk(price)
    const pointTime = new Date(start.getTime() + index * 5 * 60 * 1000)
    points.push({
      time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price,
    })
  }

  return points
}

export function StockTradingSimulation() {
  const [selectedSymbol, setSelectedSymbol] = useState<StockSymbol>('AAPL')
  const [prices, setPrices] = useState<PriceMap>(BASE_PRICES)
  const [startingInvestmentInput, setStartingInvestmentInput] = useState('10000')
  const [startingInvestment, setStartingInvestment] = useState(10000)
  const [premiumCost, setPremiumCost] = useState(1)
  const [shortTermTaxRate, setShortTermTaxRate] = useState(25)
  const [quantity, setQuantity] = useState(1)

  const [cash, setCash] = useState(10000)
  const [holdings, setHoldings] = useState<Holdings>(() =>
    Object.fromEntries(TOP_SP_STOCKS.map((symbol) => [symbol, { shares: 0, avgCost: 0 }])) as Holdings,
  )
  const [realizedEarnings, setRealizedEarnings] = useState(0)

  const [liveSeries, setLiveSeries] = useState<TimePoint[]>([])
  const [historicalSeries, setHistoricalSeries] = useState<TimePoint[]>(() =>
    generateHistoricalDay(BASE_PRICES.AAPL),
  )
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioPoint[]>([])

  const marketValue = useMemo(
    () =>
      TOP_SP_STOCKS.reduce(
        (total, symbol) => total + holdings[symbol].shares * prices[symbol],
        0,
      ),
    [holdings, prices],
  )

  const totalBalance = cash + marketValue

  useEffect(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLiveSeries([{ time: now, price: prices[selectedSymbol] }])
    setHistoricalSeries(generateHistoricalDay(prices[selectedSymbol]))
  }, [selectedSymbol])

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev }
        TOP_SP_STOCKS.forEach((symbol) => {
          next[symbol] = randomWalk(next[symbol])
        })
        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setLiveSeries((prev) => {
      const next = [...prev, { time: now, price: prices[selectedSymbol] }]
      return next.slice(-60)
    })

    setPortfolioHistory((prev) => {
      const next = [
        ...prev,
        {
          tick: now,
          balance: totalBalance,
          earnings: totalBalance - startingInvestment,
        },
      ]
      return next.slice(-80)
    })
  }, [prices, selectedSymbol, totalBalance, startingInvestment])

  const applyStartingInvestment = () => {
    const amount = Number(startingInvestmentInput)
    if (Number.isNaN(amount) || amount <= 0) {
      return
    }

    const resetHoldings = Object.fromEntries(
      TOP_SP_STOCKS.map((symbol) => [symbol, { shares: 0, avgCost: 0 }]),
    ) as Holdings

    setStartingInvestment(amount)
    setCash(amount)
    setHoldings(resetHoldings)
    setRealizedEarnings(0)
    setPortfolioHistory([])
  }

  const trade = (side: 'buy' | 'sell') => {
    const symbol = selectedSymbol
    const currentPrice = prices[symbol]
    const currentHolding = holdings[symbol]

    if (quantity <= 0) {
      return
    }

    if (side === 'buy') {
      const tradeCost = currentPrice * quantity + premiumCost
      if (cash < tradeCost) {
        return
      }

      const newShares = currentHolding.shares + quantity
      const weightedCost =
        currentHolding.avgCost * currentHolding.shares + currentPrice * quantity + premiumCost
      const newAvgCost = weightedCost / newShares

      setCash((prev) => prev - tradeCost)
      setHoldings((prev) => ({
        ...prev,
        [symbol]: {
          shares: newShares,
          avgCost: newAvgCost,
        },
      }))
      return
    }

    if (currentHolding.shares < quantity) {
      return
    }

    const grossRevenue = currentPrice * quantity
    const grossProfit = (currentPrice - currentHolding.avgCost) * quantity
    const taxableProfit = Math.max(grossProfit, 0)
    const tax = taxableProfit * (shortTermTaxRate / 100)
    const netRevenue = grossRevenue - premiumCost - tax

    const newShares = currentHolding.shares - quantity
    const newAvgCost = newShares === 0 ? 0 : currentHolding.avgCost

    setCash((prev) => prev + netRevenue)
    setHoldings((prev) => ({
      ...prev,
      [symbol]: {
        shares: newShares,
        avgCost: newAvgCost,
      },
    }))
    setRealizedEarnings((prev) => prev + grossProfit - tax - premiumCost)
  }

  const allocationData = TOP_SP_STOCKS
    .map((symbol) => ({
      name: symbol,
      value: holdings[symbol].shares * prices[symbol],
    }))
    .filter((item) => item.value > 0)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Stock Trading Simulation</CardTitle>
          <CardDescription>
            Random pricing simulation with intraday (5-minute) historical chart and real-time top 10 S&P market updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="startingInvestment">Starting Investment</Label>
            <div className="flex gap-2">
              <Input
                id="startingInvestment"
                type="number"
                value={startingInvestmentInput}
                onChange={(event) => setStartingInvestmentInput(event.target.value)}
              />
              <Button variant="secondary" onClick={applyStartingInvestment}>Apply</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="premium">Premium Cost / Tx</Label>
            <Input
              id="premium"
              type="number"
              value={premiumCost}
              onChange={(event) => setPremiumCost(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Short-Term Tax %</Label>
            <Input
              id="tax"
              type="number"
              value={shortTermTaxRate}
              onChange={(event) => setShortTermTaxRate(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="rounded-md border p-3 text-sm">
              <div>Starting: {formatMoney(startingInvestment)}</div>
              <div>Total Earnings: {formatMoney(totalBalance - startingInvestment)}</div>
              <div>Total Balance: {formatMoney(totalBalance)}</div>
              <div>Realized Earnings: {formatMoney(realizedEarnings)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade Panel</CardTitle>
          <CardDescription>Buy or sell selected stock with transaction premium and short-term tax consideration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <select
              id="symbol"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value as StockSymbol)}
            >
              {TOP_SP_STOCKS.map((symbol) => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label>Current Price</Label>
            <div className="rounded-md border p-2 text-sm">{formatMoney(prices[selectedSymbol])}</div>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => trade('buy')}>Buy</Button>
            <Button variant="secondary" onClick={() => trade('sell')}>Sell</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="realtime">
        <TabsList>
          <TabsTrigger value="realtime">Realtime</TabsTrigger>
          <TabsTrigger value="historical">Historical (5m)</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Realtime Price - {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={priceChartConfig} className="h-[320px] w-full">
                <LineChart data={liveSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 S&P Snapshot</CardTitle>
              <CardDescription>Prices refresh every 5 seconds.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {TOP_SP_STOCKS.map((symbol) => (
                  <div key={symbol} className="rounded-md border p-2 text-sm">
                    <div className="font-medium">{symbol}</div>
                    <div>{formatMoney(prices[symbol])}</div>
                    <div className="text-muted-foreground">Shares: {holdings[symbol].shares}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>Intraday Historical Chart - {selectedSymbol}</CardTitle>
              <CardDescription>Generated random historical prices every 5 minutes for a market day.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={priceChartConfig} className="h-[360px] w-full">
                <LineChart data={historicalSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={portfolioChartConfig} className="h-[320px] w-full">
                <LineChart data={portfolioHistory}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="tick" tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line dataKey="balance" type="monotone" stroke="var(--color-balance)" strokeWidth={2} dot={false} />
                  <Line dataKey="earnings" type="monotone" stroke="var(--color-earnings)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {allocationData.length === 0 ? (
                <div className="text-sm text-muted-foreground">No positions yet.</div>
              ) : (
                <ChartContainer
                  config={{
                    allocation: { label: 'Allocation', color: 'var(--color-chart-2)' },
                  }}
                  className="h-[300px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={allocationData} dataKey="value" nameKey="name" outerRadius={110} label>
                      {allocationData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={index % 2 === 0 ? 'var(--color-chart-1)' : 'var(--color-chart-2)'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
