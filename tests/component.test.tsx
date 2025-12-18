import {expect, test} from 'vitest'
import PaintColourButton from '../source/client/src/assets/PaintColourButton'
import RoomCodeText from '../source/client/src/assets/RoomCodeText'
import {render} from 'vitest-browser-react'

test.skip('Paint Colour Button successfully changes colour', async () => {
    const props = {
        initialBrushColour: "#000000"

    }
})

test('RoomCode displays succesfully', async () => {
    const RoomCodeProps = "123";

    const { getByText } = await render(<RoomCodeText text={RoomCodeProps}/>);
    await expect.element(getByText('123')).toBeInTheDocument();
})

// Write a test for buffering strokes in draw order


