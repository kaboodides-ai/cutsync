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
          className="min-h-screen w-full bg-[#0a0d14] text-white flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-md w-full bg-[#111622] border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-950/20 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>

            <h2 className="text-2xl font-black text-white mb-2">אירעה שגיאה בטעינת המסך</h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              התרחשה שגיאה רגעית בתצוגה. תוכל לרענן את הדף או לחזור לדף הראשי.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={this.handleReload}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/50 transition-all active:scale-95 cursor-pointer"
              >
                רענן את הדף 🔄
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-3 rounded-xl bg-[#1c2438] hover:bg-[#25304a] text-gray-200 font-semibold text-sm border border-gray-700/50 transition-all active:scale-95 cursor-pointer"
              >
                חזרה למסך הראשי 🏠
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 text-right bg-[#090c12] rounded-xl p-3 border border-gray-800 text-[11px] text-gray-400 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer text-gray-300 font-bold mb-1 select-none">
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
