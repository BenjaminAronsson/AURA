import { useEffect, useMemo } from 'react'
import { TypedBlock } from './TypedBlock'
import { buildActivationLines } from '../game/content'
import { audio } from '../game/audio'

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

  useEffect(() => {
    audio.activation()
  }, [])

  return (
    <div className="screen activation">
      <div className="activation-inner">
        <TypedBlock lines={lines} cps={48} holdMs={1400} onDone={onDone} />
      </div>
    </div>
  )
}
