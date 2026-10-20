'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Check,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react'
import { CreateCustomerDialog } from '@/app/(dashboard)/admin/customers/create-customer-dialog'
import { cn } from 'cn'

export interface CustomerOption {
  id: string
  name: string
  address: string
  phone?: string | null
}

interface CustomerSearchSelectProps {
  customers: CustomerOption[]
  selectedCustomerId: string
  onSelectCustomer: (customerId: string, customer?: CustomerOption) => void
  onCustomerCreated: (customer: CustomerOption) => void
  disabled?: boolean
}

function highlightMatch(text: string, query: string) {
  if (!query.trim() || !text) return text
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/20 text-primary font-semibold rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function CustomerSearchSelect({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onCustomerCreated,
  disabled = false,
}: CustomerSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [typedValue, setTypedValue] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createInitialName, setCreateInitialName] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  )

  // Derive displayed input value: show typed text when actively typing, otherwise show selected customer name
  const isTyping = open && typedValue !== null
  const displayValue = isTyping
    ? typedValue
    : selectedCustomer
    ? selectedCustomer.name
    : ''

  const searchQuery = typedValue?.trim().toLowerCase() || ''

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers

    const cleanNumber = searchQuery.replace(/\D/g, '')

    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(searchQuery)
      const matchAddress = c.address ? c.address.toLowerCase().includes(searchQuery) : false
      const matchPhone =
        cleanNumber && c.phone
          ? c.phone.replace(/\D/g, '').includes(cleanNumber)
          : false
      return matchName || matchAddress || matchPhone
    })
  }, [customers, searchQuery])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listContainerRef.current) {
      const activeEl = listContainerRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setActiveIndex(0)
    } else {
      setTypedValue(null)
      setActiveIndex(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedValue(e.target.value)
    if (!open) {
      setOpen(true)
    }
    setActiveIndex(0)
  }

  const handleInputFocus = () => {
    if (!open) {
      setOpen(true)
      setActiveIndex(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(0)
        return
      }
      setActiveIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(filteredCustomers.length - 1)
        return
      }
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCustomers.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && activeIndex >= 0 && activeIndex < filteredCustomers.length) {
        const target = filteredCustomers[activeIndex]
        handleSelect(target)
      } else if (filteredCustomers.length === 0 && searchQuery) {
        openCreateDialogWithQuery()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setTypedValue(null)
    }
  }

  const handleSelect = (customer: CustomerOption) => {
    onSelectCustomer(customer.id, customer)
    setTypedValue(null)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectCustomer('', undefined)
    setTypedValue(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (open) {
      setOpen(false)
      setTypedValue(null)
    } else {
      setOpen(true)
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }

  const openCreateDialogWithQuery = () => {
    setCreateInitialName(typedValue?.trim() || '')
    setOpen(false)
    setTypedValue(null)
    setIsCreateDialogOpen(true)
  }

  const handleDialogCustomerCreated = (customer: {
    id: string
    name: string
    address: string
    phone?: string | null
  }) => {
    onCustomerCreated(customer)
    onSelectCustomer(customer.id, customer)
    setTypedValue(null)
    setIsCreateDialogOpen(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div
            className={cn(
              'group relative flex h-9 w-full items-center rounded-lg border border-input bg-transparent text-xs transition-colors',
              'hover:bg-muted/15 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
              disabled && 'cursor-not-allowed opacity-50 bg-muted/20',
              open && 'border-ring ring-3 ring-ring/50'
            )}
          >
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="customer-options-list"
              aria-label="Pilih atau cari pelanggan"
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Cari atau pilih pelanggan..."
              disabled={disabled}
              className="h-full w-full bg-transparent px-3 pr-14 text-xs text-foreground placeholder:text-muted-foreground outline-none font-normal"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5 text-muted-foreground">
              {selectedCustomer && !disabled && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  title="Hapus pilihan"
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                tabIndex={-1}
                onClick={handleToggle}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={open ? 'Tutup daftar' : 'Buka daftar'}
              >
                <ChevronDown
                  className={cn(
                    'size-4 opacity-70 transition-transform duration-200',
                    open && 'rotate-180'
                  )}
                />
              </button>
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[var(--radix-popover-anchor-width)] min-w-[280px] p-1.5 rounded-lg border border-border bg-popover text-popover-foreground shadow-md z-50"
        >
          {/* List of Customers with explicit gap */}
          <div
            id="customer-options-list"
            role="listbox"
            ref={listContainerRef}
            className="max-h-56 overflow-y-auto flex flex-col gap-1 p-0.5"
          >
            {customers.length === 0 ? (
              <div className="py-4 px-2 text-center text-xs text-muted-foreground space-y-2">
                <p>Belum ada data pelanggan.</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setIsCreateDialogOpen(true)
                  }}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" />
                  Tambah Customer Baru
                </button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-4 px-2 text-center text-xs text-muted-foreground space-y-2">
                <p>Pelanggan &quot;{typedValue}&quot; tidak ditemukan.</p>
                <button
                  type="button"
                  onClick={openCreateDialogWithQuery}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" />
                  Daftarkan sebagai customer baru
                </button>
              </div>
            ) : (
              filteredCustomers.map((c, index) => {
                const isSelected = c.id === selectedCustomerId
                const isActive = activeIndex === index

                return (
                  <div
                    key={c.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors',
                      isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                      isSelected && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-foreground">
                        {highlightMatch(c.name, searchQuery)}
                      </div>
                      {(c.phone || c.address) && (
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {c.phone && <span>{c.phone}</span>}
                          {c.phone && c.address && <span className="mx-1">•</span>}
                          {c.address && <span>{c.address}</span>}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="size-3.5 text-primary shrink-0 ml-1.5" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Programmatic Dialog */}
      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        initialName={createInitialName}
        onCustomerCreated={handleDialogCustomerCreated}
      />
    </>
  )
}
