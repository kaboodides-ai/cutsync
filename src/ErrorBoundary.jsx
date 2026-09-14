import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = window.location.pathname
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-zinc-100 mb-2">אירעה שגיאה בטעינת המסך</h2>
            <p className="text-[13px] text-zinc-400 mb-6 leading-relaxed">
              התרחשה שגיאה רגעית בתצוגה. תוכל לרענן את הדף או לחזור לדף הראשי.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
              >
                רענן את הדף 🔄
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[13px] border border-zinc-700 transition-colors cursor-pointer"
              >
                חזרה למסך הראשי 🏠
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 text-right bg-zinc-950 rounded-lg p-3 border border-zinc-800 text-[11px] text-zinc-400 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer text-zinc-300 font-bold mb-2 select-none">
                  פרטים טכניים למפתחים
                </summary>
                <p className="text-red-400 whitespace-pre-wrap">{this.state.error?.toString()}</p>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
