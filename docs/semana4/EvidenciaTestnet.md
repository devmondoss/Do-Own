# Evidencia en Stellar Testnet — Do-Own

Generado el 2026-10-19T01:18:22.904Z en https://do-own-six.vercel.app. Cada enlace abre la operación real en el explorador público stellar.expert (testnet).

## Infraestructura

| Elemento | Enlace |
|---|---|
| Activo de recompensa DOWN | [DOWN](https://stellar.expert/explorer/testnet/asset/DOWN-GA6WNG33B7IPAAWXR4ZZ5Y5VOZRMHGDBDOLT2R575PTCSYVSO4OGOKF5) |
| Emisor de DOWN | [GA6WNG33…](https://stellar.expert/explorer/testnet/account/GA6WNG33B7IPAAWXR4ZZ5Y5VOZRMHGDBDOLT2R575PTCSYVSO4OGOKF5) |
| Patrocinador / tesorería de Do-Own | [GAUR5HX7…](https://stellar.expert/explorer/testnet/account/GAUR5HX7W4SVUM5LWLF5EARTEZF72SSWQBBPFZ7CCAYFWW6T32QKLY7B) |
| Trustline de la tesorería a DOWN | [9f6107f071…](https://stellar.expert/explorer/testnet/tx/9f6107f0718a7ace208c09e4fcdee3070105b0f01a8c1723cbcf1abb47be3e76) |
| Emisión de 1,000,000 DOWN a la tesorería | [6ec08ebf3f…](https://stellar.expert/explorer/testnet/tx/6ec08ebf3fea4f016a6c5ac755e9218ae378e0977ec3334f54b069b136dbfd4a) |

## Flujo del MVP

| # | Paso del producto | Capacidad de Stellar | Transacción |
|---|---|---|---|
| 1 | Se crea la cuenta digital de una persona (saldo 0 XLM) | Reservas patrocinadas (beginSponsoringFutureReserves + createAccount + changeTrust) | [69ff7a86bb…](https://stellar.expert/explorer/testnet/tx/69ff7a86bbc322bba068379812f8026bac178bfecf7ed715442d7c35001079fc) |
| 2 | Se crea una segunda cuenta | Reservas patrocinadas | [924ad9d007…](https://stellar.expert/explorer/testnet/tx/924ad9d007066ae0132155014c1a860d9ff418602b7f97af1efa649ca87c8b52) |
| 3 | Recompensa por registrar una decisión | Pago de DOWN con memo hash idempotente | [1ec60fff9a…](https://stellar.expert/explorer/testnet/tx/1ec60fff9a99d942c1080478cfa67444dcf03a3e265964e28a63d1f204ebfc4a) |
| 4 | Reintento del mismo reclamo (no paga dos veces) | Detección por memo hash | ✅ devolvió la misma transacción |
| 5 | Recompensa por completar la microlección | Pago de DOWN con memo hash | [353ba37cb3…](https://stellar.expert/explorer/testnet/tx/353ba37cb35ff7482ddd4d7f472e3317bb56c220710b4e3e1e84ae340d68560f) |
| 6 | Sello semanal de 3 registros (raíz Merkle con sal) | Memo hash firmado por la persona; comisión pagada con fee bump | [47db7b6018…](https://stellar.expert/explorer/testnet/tx/47db7b601848c155310104930dfd0711dd427901a308ba36bf0c729369138122) |
| 7 | Envío de 0.5 DOWN a otra persona | Pago firmado por la persona; comisión pagada con fee bump | [81829f86ad…](https://stellar.expert/explorer/testnet/tx/81829f86adc12c2e1e0d71ab568a4c039da7d1705374a7b3e20c3a5d7e9279f0) |

- Cuenta de ejemplo: [GAFHPQBI…](https://stellar.expert/explorer/testnet/account/GAFHPQBIS7ALTXEZ4F7GT6EGJUL36F5A7RTBNACMZAGNUAAVKHYC2XHJ). Saldo XLM: **0.0000000** (las reservas las cubre Do-Own); saldo DOWN: **1.5000000** (1 + 1 de recompensas − 0.5 enviado).
- Raíz sellada: `addf2451b34926cfbb6bcb00182fd411393cc89b8fa31043471a96c43b0d4b58`. Coincide con el memo publicado: **sí**.
- Página pública de verificación: https://do-own-six.vercel.app/verificar?tx=47db7b601848c155310104930dfd0711dd427901a308ba36bf0c729369138122&root=addf2451b34926cfbb6bcb00182fd411393cc89b8fa31043471a96c43b0d4b58
