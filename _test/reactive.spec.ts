import { it, describe, expect } from 'vitest'
import { computed, effect } from '../packages/reactive/effect'
import { reactive } from '../packages/reactive/reactive'

describe('reactive', () => {
  it ('basic', () => {
    const a = reactive({
      num: 1
    })
    expect(a.num).toBe(1)
    a.num+=1
    expect(a.num).toBe(2)
  })
  it('use effect', () => {
    const a = reactive({
      num: 0
    })
    let b
    effect(() => {
      b = a.num
    })
    expect(b).toBe(0)

    a.num = 1

    expect(b).toBe(1)
  })
  it('scheduler', () =>{
    const a = reactive({
      num: 0
    })
    effect(() => {
      console.log(a.num)
    }, {
      scheduler(fn) {
        setTimeout(fn)
      }
    })
    a.num++
    console.log('结束')
  })
  it('computed', () => {
    const obj = {
      a: 0,
      b: 1,
    }
    const v =computed(() => obj.a + obj.b)
    expect(v.value).toBe(1)
  })
})