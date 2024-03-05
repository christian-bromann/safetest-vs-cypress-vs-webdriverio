/// <reference types="@wdio/visual-service" />
import React from 'react'
import { expect, $ } from '@wdio/globals'
import { fn } from '@wdio/browser-runner'
import { render, screen, fireEvent } from '@testing-library/react'

import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)

describe('React Component Tests', () => {
    it('simple', async () => {
        const { container } = render(<div>Test1</div>)
        await expect($(container)).toHaveText('Test1')
    })

    it.skip('can do many interactions fast', async () => {
        const Counter = () => {
            const [count, setCount] = React.useState(0)
            return (
                <div>
                    <button onClick={() => setCount(count + 1)}>Count is {count}</button>
                </div>
            )
        }
        const start = Date.now()
        const { container } = render(<Counter />)
        await expect($(container)).toHaveText('Count is 0')
        for (let i = 1; i <= 500; i++) {
          await $('button').click()
          await expect($(container)).toHaveText(`Count is ${i}`)
        }
        console.log(`This took ${Date.now() - start}ms`)
        // This took 11830ms
    })

    it('can do many interactions faster', async () => {
        const Counter = () => {
            const [count, setCount] = React.useState(0)
            return (
                <div>
                    <button onClick={() => setCount(count + 1)}>Count is {count}</button>
                </div>
            )
        }
        const start = Date.now()
        render(<Counter />)
        const component = screen.getByText(/count is 0/i)
        expect(component).toBeInTheDocument()
        for (let i = 1; i <= 500; i++) {
            await fireEvent.click(component)
            expect(component).toHaveTextContent(`Count is ${i}`)
        }

        console.log(`This took ${Date.now() - start}ms`)
        // This took 36ms
    })

    it('can bridge into the component directly', async () => {
        let count = 0;
        let forceNumber: (num: number) => void = () => {};
        const Counter = () => {
          const forceRender = React.useReducer(() => count, 0)[1];
          forceNumber = (n) => {
            count = n;
            forceRender();
          };
          return (
            <div>
              <button
                onClick={() => {
                  count++;
                  forceRender();
                }}
              >
                Count is {count}
              </button>
            </div>
          );
        };
      
        const { container } = render(<Counter />)
        await expect($(container)).toHaveText('Count is 0')
        await $('button').click()
        await expect($(container)).toHaveText('Count is 1')
        forceNumber(50);
        await expect($(container)).toHaveText('Count is 50')
        await $('button').click()
        await expect($(container)).toHaveText('Count is 51')
    })

    it('can use mocks and spies', async () => {
        const clickMock = fn()
        render(<button onClick={clickMock}>Test1</button>)
        await $('button').click()
        await expect(clickMock).toHaveBeenCalledTimes(1)
    })

    it('supports snapshot testing', async () => {
        const Counter = () => {
            const [count, setCount] = React.useState(0)
            return (
                <div>
                    <button onClick={() => setCount(count + 1)}>Count is {count}</button>
                </div>
            )
        }
        const { container } = render(<Counter />)
        await expect(container).toMatchElementSnapshot('counter')
        await expect($('button')).toMatchInlineSnapshot(
            `"<button>Count is 0</button>"`)
    })
})
