class GroupAnimator {
    constructor() {
        this.elems = []
    }
	
	setFrom(...elems) {
        const newElements = Array.from(elems).map(e => {
            const s = new Animator(e)
            s.setFrom()
            return s
        })
        this.elems = [...this.elems, ...newElements]
    }

    animate() {
        this.elems.forEach(e => {
            e.setTo()
        })
        this.elems.forEach(e => {
            e.setTransformAndOpacityStyle()
        })
        self = this
        requestAnimationFrame(() => {
            // nested animationframe bc firefox transition doesnt reliably fire but with
            // a second, nested animationframe the firefox transition works as expected
            requestAnimationFrame(() => {
                self.elems.forEach(e => {
                    e.animate()
                })
            })
        })
    }
}


class Animator {
    static animationEventName = "animatorend"

    constructor(elem) {
        this.elem = elem
        this.before = null
        this.after = null
        this.invertedOpacity = null
        this.initialTransitionProperties = null
        this.transitionEndHandler = this.transitionEndHandler.bind(this)
    }

    transitionEndHandler(e) {
        this.elem.style.transform = ""
        this.elem.style.transformOrigin = ""
        this.elem.style.opacity = ""
        this.elem.style.transition = ""
        this.elem.style.transitionDuration = ""
        this.elem.style.transitionDelay = ""
        this.elem.style.transitionProperty = ""
        this.elem.style.transitionTimingFunction = ""
		// dispatch event after longest transition finished
        if(e.propertyName === this.longestInitialTransition.property) {
            let evt = new CustomEvent(this.constructor.animationEventName, { 
                detail: e.propertyName, 
                bubbles:false, 
                cancelable:true
            })
            this.elem.dispatchEvent(evt)
            this.elem.removeEventListener("transitionend", this.transitionEndHandler)
            this.reset()
        }
    }

    setFrom() {
        this.elem.addEventListener("transitionend", this.transitionEndHandler)
        this.before = this.elem.getBoundingClientRect()
        const computedStyle = getComputedStyle(this.elem)
        this.before.opacity = parseFloat(computedStyle.opacity)
        this.initialTransitionProperties = {
            transitionDuration: computedStyle.transitionDuration,
            transitionDelay: computedStyle.transitionDelay,
            transitionProperty: computedStyle.transitionProperty,
            transitionTimingFunction: computedStyle.transitionTimingFunction
        }
        // prevent any transitions when inverting the transforms, opacity
        this.elem.style.transitionProperty = "none"
    }

    setTo() {
        this.after = this.elem.getBoundingClientRect()
        const computedStyle = getComputedStyle(this.elem)
        this.after.opacity = parseFloat(computedStyle.opacity)
    }

    setTransformAndOpacityStyle() {
        this.elem.style.transform = this.getTransformStyle()
        this.invertedOpacity = this.after.opacity - this.before.opacity
        this.elem.style.opacity = this.before.opacity
    }

    getTransformStyle() {
        const before = this.before
        const after = this.after
        const topDiff = before.top - after.top
        const leftDiff = before.left - after.left
        let heightDiff = before.height / after.height
        heightDiff = isNaN(heightDiff) ? 1 : heightDiff
        let widthDiff = before.width / after.width
        widthDiff = isNaN(widthDiff) ? 1 : widthDiff
        return `translate(${leftDiff}px, ${topDiff}px) scale(${widthDiff}, ${heightDiff})`
    }

    reset() {
        this.before = null
        this.after = null
        this.invertedOpacity = null
        this.initialTransitionProperties = null
    }

    get longestInitialTransition() {
        const result = {}
        const initialDurationArray = this.initialTransitionProperties.transitionDuration.split(",").map(val => parseFloat(val))
        const maxInitialTransitionDuration = Math.max(...initialDurationArray)
        const maxIdx = initialDurationArray.findIndex(item => item === maxInitialTransitionDuration)
        const maxInitialTransitionProperty = this.initialTransitionProperties.transitionProperty.split(",")[maxIdx].trim()
        result.duration = maxInitialTransitionDuration
        result.property = maxInitialTransitionProperty
        return result
    }

    get transitionOnAnimation() {
        const result = {...this.initialTransitionProperties}
        if(this.longestInitialTransition.duration === 0) {
            // use a very short transition to ensure cleanup (in transitionend) work is done
            // if a transition is not explicitly used
            result.transitionDuration = ".01s"
        }
        return result
    }

    animate() {
        const transitionProperties = this.transitionOnAnimation
        this.elem.style.transition = ""
        this.elem.style.transitionDuration = transitionProperties.transitionDuration
        this.elem.style.transitionDelay = transitionProperties.transitionDelay
        this.elem.style.transitionProperty = transitionProperties.transitionProperty
        this.elem.style.transitionTimingFunction = transitionProperties.transitionTimingFunction
        this.elem.style.transformOrigin = "top left"
        this.elem.style.transform = ""
        this.elem.style.opacity = this.before.opacity + this.invertedOpacity
    }
}

export {
    GroupAnimator as default,
    GroupAnimator,
    Animator
}