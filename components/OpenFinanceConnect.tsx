import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
// Arquivo removido conforme solicitado. Open Finance será refeito do zero.
                  <span>
                    {acc.balance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: acc.currencyCode,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OpenFinanceConnect
