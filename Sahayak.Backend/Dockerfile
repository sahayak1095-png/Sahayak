FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY ["Sahayak.Backend/Sahayak.Backend.csproj", "Sahayak.Backend/"]
RUN dotnet restore "Sahayak.Backend/Sahayak.Backend.csproj"

# copy everything else and publish
COPY . .
WORKDIR "/src/Sahayak.Backend"
RUN dotnet publish "Sahayak.Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "Sahayak.Backend.dll"]
