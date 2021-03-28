function swap(e1, e2) {
    const e1Parent = e1.parentNode
    const e2Parent = e2.parentNode
    const e1Next = e1.nextElementSibling
    e2Parent.insertBefore(e1, e2)
    if(e1Next === e2) {
        e1Parent.insertBefore(e2, e1)
    } else {
        e1Parent.insertBefore(e2, e1Next)
    }
}

function euclideanDistanceTo(e1, e2) {
    const e1Pos = midPointOf(e1)
    const e2Pos = midPointOf(e2)
    return Math.sqrt(Math.pow(e1Pos.x - e2Pos.x, 2) + Math.pow(e1Pos.y - e2Pos.y, 2))
}

function midPointOf(e) {
    const dims = e.getBoundingClientRect()
    return {
        x: dims.left + (dims.width / 2),
        y: dims.top + (dims.height / 2)
    }
}

function elementUnderMidPointOf(e) {
    const initialPE = e.style.pointerEvents
    const { x, y } = midPointOf(e)
	e.style.pointerEvents = "none"
    const result = document.elementFromPoint(x, y)
    e.style.pointerEvents = initialPE
    return result
}

function quadrantOf(e1, e2) {
    const { x, y } = midPointOf(e1)
    const { x: x2, y: y2 } = midPointOf(e2)
    const yQuadrant = y <= y2 ? "top" : "bottom"
    const xQuadrant = x <= x2 ? "left" : "right"
    return `${yQuadrant}-${xQuadrant}`
}

function isMidPointInsideOf(e1, e2) {
    const { x, y } = midPointOf(e1)
    const underDims = e2.getBoundingClientRect()
    return (
        x > underDims.left
        && x < underDims.right
        && y < underDims.bottom
        && y > underDims.top
    )
}

export {
    swap,
    euclideanDistanceTo,
    midPointOf,
    elementUnderMidPointOf,
    quadrantOf,
    isMidPointInsideOf
}