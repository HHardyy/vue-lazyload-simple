const loadImageAsync = (src, resolve, reject) => {
	let image = new Image()
	image.src = src
	image.onload = resolve
	image.onerror = reject
}

const getNodeScrollParent = (el) => {
	let scrollParent = el.parentNode
	while(scrollParent) {
		if(/(scroll)|(auto)/.test(getComputedStyle(scrollParent)['overflow'])) {
			return scrollParent
		}
		scrollParent = scrollParent.parentNode
	}
	return scrollParent
}

const Lazy = (Vue) => {
	class ReactiveListener {
		constructor({el, src, options, elRender}) {
			this.el = el
			this.src = src
			this.options = options
			this.elRender = elRender

			this.state = { loading: false }
		}
		checkInview () {
			let {top} = this.el.getBoundingClientRect()
			return top < window.innerHeight * (this.options.preLoad || 1.3)
		}
		load () {
			this.elRender(this, 'loading')
			loadImageAsync(this.src, () => {
				this.state.loading = true
				this.elRender(this, 'finish')
			}, () => {
			    this.elRender(this, 'error')
			})
		}
	}

	return class LazyClass {
		constructor(options){
			this.options = options
			this.bindHandler = false

			this.listenerQueue = []
		}
		handleLazyLoad () {
			this.listenerQueue.forEach(listener => {
				if (!listener.state.loading) {
					let catIn = listener.checkInview()
					catIn && listener.load()
				}
			})
		}
		add (el, bindings, vnode) {
			Vue.nextTick(() => {
				let nodeScrolParent = getNodeScrollParent(el)
				if (nodeScrolParent && !this.bindHandler) {
					this.bindHandler = true
					console.log(nodeScrolParent)
					nodeScrolParent.addEventListener('scroll', this.handleLazyLoad.bind(this))
				}

				console.log(bindings.value)

				let listener = new ReactiveListener({
					el,
					src:bindings.value,
					options: this.options,
					elRender: this.elRender.bind(this)
				})
				this.listenerQueue.push(listener)
				this.handleLazyLoad()
			})
		}
		elRender (listener, state) {
			let el = listener.el
			let src = ''
			switch(state) {
				case 'loading':
				    src = listener.options.loading || ''
				    break
				case 'error':
				    src = listener.options.error || ''
				    break
				default:
				    src = listener.src
				    break
			}
			el.setAttribute('src', src)
		}
	}
}


const VueLazyload = {
	install (Vue, options) {
		const LazyClass = Lazy(Vue)
		const lazy = new LazyClass(options)

		Vue.directive('lazy', {
			bind:lazy.add.bind(lazy)
		})
	}
}
