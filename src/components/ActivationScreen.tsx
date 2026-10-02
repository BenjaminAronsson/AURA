import { useMemo } from 'react'
import { TypedBlock } from './TypedBlock'
import { buildActivationLines } from '../game/content'

interface Props {
  operatorId: string
  onDone: () => void
}

/** The "AURA operating again" reactivation sequence between login and terminal. */
export function ActivationScreen({ operatorId, onDone }: Props) {
  const lines = useMemo(
    () => buildActivationLines(operatorId).map((text) => ({ kind: 'aura', text })),
    [operatorId],
  )

  return (
    <div className="screen activation">
      <div className="activation-inner">
        <TypedBlock lines={lines} cps={48} holdMs={1400} onDone={onDone} />
      </div>
    </div>
  )
}
