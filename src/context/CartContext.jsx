import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('ertadih_cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  useEffect(() => {
    localStorage.setItem('ertadih_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const sameProduct = item.id === product.id
        const sameVariant = (item.variantIndex ?? null) === (product.variantIndex ?? null)
        const sameColor = (item.color || '') === (product.color || '')
        const sameSize = (item.size || '') === (product.size || '')

        return sameProduct && sameVariant && sameColor && sameSize
      })

      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }
        return updated
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          imageUrl: product.imageUrl || '',
          category: product.category || '',
          quantity: 1,
          variantIndex:
            typeof product.variantIndex === 'number' ? product.variantIndex : null,
          color: product.color || '',
          size: product.size || '',
        },
      ]
    })
  }

  const removeFromCart = (indexToRemove) => {
    setCartItems((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const updateQuantity = (indexToUpdate, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(indexToUpdate)
      return
    }

    setCartItems((prev) =>
      prev.map((item, index) =>
        index === indexToUpdate
          ? { ...item, quantity: Number(newQuantity) }
          : item
      )
    )
  }

  const increaseQuantity = (indexToUpdate) => {
    setCartItems((prev) =>
      prev.map((item, index) =>
        index === indexToUpdate
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQuantity = (indexToUpdate) => {
    setCartItems((prev) =>
      prev
        .map((item, index) =>
          index === indexToUpdate
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity)
    }, 0)
  }, [cartItems])

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)
  }, [cartItems])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}