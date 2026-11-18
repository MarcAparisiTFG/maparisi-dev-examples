#!/bin/sh
# Ejecuta la demo con el access token a 2 s para no esperar 5 minutos.
J=$(mktemp); B=http://localhost:3917
echo "1) login";                   R=$(curl -s -c $J -X POST $B/login); echo "$R"
A=$(echo "$R" | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
echo "   cookie guardada:"; grep refresh $J | awk '{print "   path", $3, "· httponly", ($1 ~ /HttpOnly/ ? "sí" : "no"), "·", substr($7,1,12) "…"}'
VIEJO=$(grep refresh $J | awk '{print $7}')
echo "2) pedidos con el access";   curl -s -b $J -H "Authorization: Bearer $A" $B/api/pedidos; echo
sleep 3
echo "3) pedidos 3 s después";     curl -s -b $J -H "Authorization: Bearer $A" $B/api/pedidos; echo
echo "4) refresh (rota)";          curl -s -b $J -c $J -X POST $B/auth/refresh | cut -c1-60; echo
NUEVO=$(grep refresh $J | awk '{print $7}'); echo "   refresh viejo ${VIEJO%${VIEJO#????????}}… → nuevo ${NUEVO%${NUEVO#????????}}…"
echo "5) alguien usa el viejo";    curl -s -H "Cookie: refresh=$VIEJO" -X POST $B/auth/refresh; echo
echo "6) y ahora el bueno";        curl -s -b $J -X POST $B/auth/refresh; echo
rm $J
