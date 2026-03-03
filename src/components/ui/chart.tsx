import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border [&_.recharts-surface]:outline-none',
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, conf]) => conf.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {${colorConfig
          .map(([key, conf]) => `--color-${key}: ${conf.color};`)
          .join('')}}`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  className?: string
}) {
  const { config } = useChart()
  const tooltipPayload = (payload ?? []) as Array<{
    dataKey?: string | number | ((obj: unknown) => unknown)
    value?: string | number | Array<string | number>
    name?: string | number
  }>

  if (!active || !tooltipPayload.length) {
    return null
  }

  return (
    <div className={cn('rounded-lg border bg-background p-2 text-xs shadow-sm', className)}>
      <div className="grid gap-1">
        {tooltipPayload.map((item, index) => {
          const key =
            typeof item.dataKey === 'function'
              ? String(item.name ?? `series-${index}`)
              : String(item.dataKey ?? item.name ?? `series-${index}`)
          const value = Array.isArray(item.value)
            ? Number(item.value[0] ?? 0)
            : Number(item.value ?? 0)
          const label = config[key]?.label ?? key
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value.toFixed(2)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({ payload }: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
  const { config } = useChart()
  const legendPayload = (payload ?? []) as Array<{
    dataKey?: string | number | ((obj: unknown) => unknown)
    value?: string | number
    color?: string
  }>

  if (!legendPayload.length) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      {legendPayload.map((item, index) => {
        const key =
          typeof item.dataKey === 'function'
            ? String(item.value ?? `series-${index}`)
            : String(item.dataKey ?? item.value ?? `series-${index}`)
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{config[key]?.label ?? key}</span>
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
